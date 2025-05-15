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
        
        // Check if database is available by attempting a simple query
        const { data: healthCheck, error: healthError } = await supabase.from('app_settings').select('count(*)');
        
        // If there's an error, we're likely in in-memory mode
        if (healthError) {
          console.log('Using in-memory configuration - database not available');
          setLoading(false);
          return; // Use default config
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
      
      // Check if database is available by making a simple query
      const { data: healthCheck, error: healthError } = await supabase.from('app_settings').select('count(*)');
      
      // If there's an error, we're likely in in-memory mode
      const useInMemoryMode = !!healthError;
      
      if (useInMemoryMode) {
        console.log('Using in-memory configuration mode');
        // Use local state only
        setConfig(prevConfig => ({
          ...prevConfig,
          ...newConfig,
        }));
        setLoading(false);
        return; // Exit early
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
      
      // Try a bulk upsert first for better performance
      try {
        const bulkSettings = settings.map(setting => ({
          key: setting.key,
          value: setting.value,
          type: setting.type,
          updatedAt: new Date().toISOString(),
        }));
        
        const { error: bulkUpsertError } = await supabase
          .from('app_settings')
          .upsert(bulkSettings, { onConflict: 'key' });
        
        if (bulkUpsertError) {
          console.warn('Bulk upsert failed, trying individual updates:', bulkUpsertError.message);
          
          // Fallback: process each setting one by one
          let successCount = 0;
          for (const setting of settings) {
            const { error: upsertError } = await supabase
              .from('app_settings')
              .upsert({
                key: setting.key,
                value: setting.value,
                type: setting.type,
                updatedAt: new Date().toISOString(),
              }, { onConflict: 'key' });
            
            if (!upsertError) {
              successCount++;
            } else {
              console.error(`Failed to update setting ${setting.key}:`, upsertError.message);
            }
          }
          
          console.log(`Successfully updated ${successCount} of ${settings.length} settings individually`);
        } else {
          console.log(`Successfully bulk updated all ${settings.length} settings`);
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
      
      // Always update local state with the new config regardless of DB success
      setConfig(prevConfig => ({
        ...prevConfig,
        ...newConfig,
      }));
      console.log('Local configuration updated successfully');
      
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