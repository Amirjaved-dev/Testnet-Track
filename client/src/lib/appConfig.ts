import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { AppConfig, AppConfigSchema } from '@shared/schema';

// Default app configuration
export const defaultAppConfig: AppConfig = {
  appName: "Monad Wallet Analyzer",
  appDescription: "Analyze Monad wallets and check airdrop eligibility",
  primaryColor: "#6366f1", // Indigo-500
  secondaryColor: "#8b5cf6", // Purple-500
  showAds: true,
  airdropRequirements: {
    ethTransactions: 10,
    requireNadsNft: true,
    monTokenBalance: 10,
    monadTransactions: 200,
    requireEarlyAdopter: true,
  },
  socialLinks: []
};

// Create context
type AppConfigContextType = {
  config: AppConfig;
  loading: boolean;
  error: string | null;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
};

const AppConfigContext = createContext<AppConfigContextType>({
  config: defaultAppConfig,
  loading: false,
  error: null,
  updateConfig: async () => {},
});

// Hook to use app config
export const useAppConfig = () => useContext(AppConfigContext);

// Provider component
type AppConfigProviderProps = {
  children: ReactNode;
};

export const AppConfigProvider = ({ children }: AppConfigProviderProps) => {
  const [config, setConfig] = useState<AppConfig>(defaultAppConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch app settings from Supabase
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch settings from Supabase
        // First check if the app_settings table exists
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'app_settings');
        
        if (tablesError) {
          console.warn('Error checking for app_settings table:', tablesError.message);
          return; // Use default config
        }
        
        // If the table doesn't exist, use default settings
        if (!tablesData || tablesData.length === 0) {
          console.info('app_settings table not found, using default config');
          return;
        }

        // Fetch actual settings
        const { data, error: fetchError } = await supabase
          .from('app_settings')
          .select('*');
        
        if (fetchError) {
          throw new Error(`Failed to fetch app settings: ${fetchError.message}`);
        }
        
        if (data && data.length > 0) {
          // Process the data into a config object
          const configObj: Record<string, any> = {};
          
          data.forEach(setting => {
            // Process the value based on its type
            let processedValue: any = setting.value;
            
            if (setting.type === 'number') {
              processedValue = Number(setting.value);
            } else if (setting.type === 'boolean') {
              processedValue = setting.value === 'true';
            } else if (setting.type === 'json') {
              try {
                processedValue = JSON.parse(setting.value);
              } catch (e) {
                console.error(`Failed to parse JSON for setting ${setting.key}:`, e);
              }
            }
            
            // Handle nested properties (e.g. "airdropRequirements.ethTransactions")
            if (setting.key.includes('.')) {
              const parts = setting.key.split('.');
              const mainKey = parts[0];
              const subKey = parts[1];
              
              if (!configObj[mainKey]) {
                configObj[mainKey] = {};
              }
              
              configObj[mainKey][subKey] = processedValue;
            } else {
              configObj[setting.key] = processedValue;
            }
          });
          
          // Merge with default config and validate with zod schema
          const mergedConfig = {
            ...defaultAppConfig,
            ...configObj
          };
          
          const validatedConfig = AppConfigSchema.parse(mergedConfig);
          setConfig(validatedConfig);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error loading app settings:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppSettings();
  }, []);
  
  // Helper type for settings
  type FlatSetting = {
    key: string;
    value: string;
    type: string;
  };
  
  // Function to update app configuration
  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      setLoading(true);
      
      // First, ensure the app_settings table exists
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'app_settings');
      
      if (tablesError) {
        console.warn('Error checking for app_settings table:', tablesError.message);
        // Use local state only
        setConfig(prevConfig => ({
          ...prevConfig,
          ...newConfig,
        }));
        return; // Exit early
      }
      
      // If the app_settings table doesn't exist, try to create it
      if (!tablesData || tablesData.length === 0) {
        console.info('Creating app_settings table...');
        const { error: createError } = await supabase.rpc('create_app_settings_table');
        
        if (createError) {
          console.error('Failed to create app_settings table:', createError.message);
          // Fall back to using local state only
          setConfig(prevConfig => ({
            ...prevConfig,
            ...newConfig,
          }));
          return; // Exit early
        }
      }
      
      // Convert the config to flat settings for storage
      const settings: FlatSetting[] = [];
      
      // Flatten the object for storage
      const flattenObject = (obj: any, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const newKey = prefix ? `${prefix}.${key}` : key;
          
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            // Recurse for nested objects
            flattenObject(value, newKey);
          } else {
            // Determine the appropriate type
            let type = typeof value;
            let stringValue: string;
            
            if (Array.isArray(value)) {
              stringValue = JSON.stringify(value);
              type = 'object'; // Use 'object' for JSON data
            } else if (value === null || value === undefined) {
              return; // Skip null/undefined values
            } else if (typeof value === 'object') {
              stringValue = JSON.stringify(value);
              type = 'object'; // Use 'object' for JSON data
            } else {
              stringValue = String(value);
            }
            
            settings.push({
              key: newKey,
              value: stringValue,
              type,
            });
          }
        });
      };
      
      flattenObject(newConfig);
      
      // Update each setting in Supabase
      for (const setting of settings) {
        const { error: upsertError } = await supabase
          .from('app_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            type: setting.type,
            updatedAt: new Date().toISOString(),
          }, { onConflict: 'key' });
        
        if (upsertError) {
          console.error(`Failed to update setting ${setting.key}:`, upsertError.message);
        }
      }
      
      // Update local state with the new config
      setConfig(prevConfig => ({
        ...prevConfig,
        ...newConfig,
      }));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error updating app settings:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const contextValue = {
    config,
    loading,
    error,
    updateConfig
  };
  
  return React.createElement(AppConfigContext.Provider, 
    { value: contextValue }, 
    children
  );
};