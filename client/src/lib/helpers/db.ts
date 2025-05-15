import { supabase } from '../supabase';

// Function to create dummy advertisements
export async function createDummyAdvertisements() {
  try {
    // First check if the advertisements table exists
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'advertisements');
    
    if (tablesError) {
      console.warn('Error checking for advertisements table:', tablesError.message);
      return false;
    }
    
    // If the table doesn't exist, we can't create ads
    if (!tablesData || tablesData.length === 0) {
      console.info('advertisements table not found, creating...');
      
      // Try to create the table
      const { error: createError } = await supabase.rpc('create_advertisements_table');
      
      if (createError) {
        console.error('Failed to create advertisements table:', createError.message);
        return false;
      }
    }
    
    // Check if we already have advertisements
    const { data, error } = await supabase
      .from('advertisements')
      .select('*');
      
    if (error) {
      console.error('Error checking for existing advertisements:', error.message);
      return false;
    }
    
    // If we have ads, don't create more
    if (data && data.length > 0) {
      console.log(`Found ${data.length} existing advertisements`);
      return true;
    }
    
    // Sample ads
    const sampleAds = [
      {
        title: 'Monad Testnet Live',
        content: 'Experience the future of blockchain with Monad Testnet. Fast, scalable, and secure.',
        placement: 'home',
        imageUrl: 'https://pbs.twimg.com/profile_images/1727846447165206528/JJ7cGjwf_400x400.jpg',
        targetUrl: 'https://monad.xyz',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'system'
      },
      {
        title: 'Join the Monad Community',
        content: 'Connect with other developers and enthusiasts in the Monad ecosystem.',
        placement: 'airdrop',
        imageUrl: 'https://pbs.twimg.com/profile_images/1727846447165206528/JJ7cGjwf_400x400.jpg',
        targetUrl: 'https://discord.gg/monad',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'system'
      },
      {
        title: 'Monad Documentation',
        content: 'Learn how to build on Monad with comprehensive guides and tutorials.',
        placement: 'sidebar',
        imageUrl: '',
        targetUrl: 'https://docs.monad.xyz',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'system'
      },
      {
        title: 'Get Monad Updates',
        content: 'Stay informed about the latest developments in the Monad ecosystem.',
        placement: 'airdrop-side',
        imageUrl: '',
        targetUrl: 'https://twitter.com/monad_xyz',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'system'
      }
    ];
    
    // Insert the sample ads
    const { error: insertError } = await supabase
      .from('advertisements')
      .insert(sampleAds);
      
    if (insertError) {
      console.error('Error inserting dummy advertisements:', insertError.message);
      return false;
    }
    
    console.log('Successfully created dummy advertisements');
    return true;
  } catch (error) {
    console.error('Error creating dummy advertisements:', error);
    return false;
  }
}