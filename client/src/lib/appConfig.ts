import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  updateConfig: async () => {}
});

// Hook to use app config
export const useAppConfig = () => useContext(AppConfigContext);

// Provider component
type AppConfigProviderProps = {
  children: ReactNode;
};

// Type for flattened settings
type FlattenedSetting = {
  key: string;
  value: string;
  type: string;
};

export const AppConfigProvider = ({ children }: AppConfigProviderProps) => {
  const [config, setConfig] = useState<AppConfig>(defaultAppConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch app settings from Supabase
  useEffect(() => {
    const fetchAppSettings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('app_settings')
          .select('key, value, type');
        
        if (fetchError) {
          throw new Error(`Error fetching app settings: ${fetchError.message}`);
        }
        
        // Parse settings into config object
        if (data && data.length > 0) {
          const configData: Record<string, any> = {};
          
          for (const setting of data) {
            let value: any = setting.value;
            
            // Parse value based on type
            switch (setting.type) {
              case 'number':
                value = parseFloat(value);
                break;
              case 'boolean':
                value = value === 'true';
                break;
              case 'json':
                value = JSON.parse(value);
                break;
            }
            
            // Handle nested properties (e.g., airdropRequirements.ethTransactions)
            if (setting.key.includes('.')) {
              const [parent, child] = setting.key.split('.');
              configData[parent] = { 
                ...(configData[parent] || {}),
                [child]: value 
              };
            } else {
              configData[setting.key] = value;
            }
          }
          
          // Validate and merge with defaults
          const parsedConfig = AppConfigSchema.parse({
            ...defaultAppConfig,
            ...configData,
          });
          
          setConfig(parsedConfig);
        }
      } catch (err) {
        console.error("Failed to load app configuration:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppSettings();
  }, []);
  
  // Update app settings
  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, flatten the configuration for storage
      const flattenedSettings: FlattenedSetting[] = [];
      
      // Helper function to flatten the config object
      const flattenConfig = (obj: any, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Recursively flatten nested objects
            flattenConfig(value, fullKey);
          } else {
            // Determine the type and stringify the value
            let type: string = typeof value;
            let stringValue: string;
            
            if (Array.isArray(value)) {
              type = 'json';
              stringValue = JSON.stringify(value);
            } else if (type === 'object') {
              type = 'json';
              stringValue = JSON.stringify(value);
            } else {
              stringValue = String(value);
            }
            
            flattenedSettings.push({
              key: fullKey,
              value: stringValue,
              type,
            });
          }
        }
      };
      
      flattenConfig(newConfig);
      
      // Update settings in Supabase
      for (const setting of flattenedSettings) {
        const { error: upsertError } = await supabase
          .from('app_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            type: setting.type,
            updatedAt: new Date().toISOString()
          }, { onConflict: 'key' });
        
        if (upsertError) {
          throw new Error(`Error updating setting ${setting.key}: ${upsertError.message}`);
        }
      }
      
      // Update the local state
      setConfig(prev => ({
        ...prev,
        ...newConfig,
      }));
    } catch (err) {
      console.error("Failed to update app configuration:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AppConfigContext.Provider value={{ config, loading, error, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
};