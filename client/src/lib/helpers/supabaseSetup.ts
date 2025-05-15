import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';

/**
 * Creates necessary tables in Supabase if they don't exist
 */
export async function setupSupabaseTables() {
  try {
    console.log('Setting up Supabase tables...');
    
    // First check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase.from('profiles').select('count(*)');
    
    if (healthError) {
      console.warn('Cannot connect to Supabase, skipping table setup:', healthError.message);
      return false;
    }
    
    // Try to create admin_users table if it doesn't exist
    // In a real app, we would use migrations, but for simplicity we'll use RPC calls
    const { error: adminTableError } = await supabase.rpc('create_admin_users_table');
    
    if (adminTableError) {
      // Ignore if it's already exists error
      if (!adminTableError.message.includes('already exists')) {
        console.error('Error creating admin_users table:', adminTableError.message);
      } else {
        console.log('admin_users table already exists');
      }
    } else {
      console.log('Successfully created admin_users table');
    }
    
    // Try to create profiles table if it doesn't exist
    const { error: profilesTableError } = await supabase.rpc('create_profiles_table');
    
    if (profilesTableError) {
      // Ignore if it's already exists error
      if (!profilesTableError.message.includes('already exists')) {
        console.error('Error creating profiles table:', profilesTableError.message);
      } else {
        console.log('profiles table already exists');
      }
    } else {
      console.log('Successfully created profiles table');
    }
    
    // Try to create app_settings table if it doesn't exist
    const { error: settingsTableError } = await supabase.rpc('create_app_settings_table');
    
    if (settingsTableError) {
      // Ignore if it's already exists error
      if (!settingsTableError.message.includes('already exists')) {
        console.error('Error creating app_settings table:', settingsTableError.message);
      } else {
        console.log('app_settings table already exists');
      }
    } else {
      console.log('Successfully created app_settings table');
    }
    
    // Try to create advertisements table if it doesn't exist
    const { error: adsTableError } = await supabase.rpc('create_advertisements_table');
    
    if (adsTableError) {
      // Ignore if it's already exists error
      if (!adsTableError.message.includes('already exists')) {
        console.error('Error creating advertisements table:', adsTableError.message);
      } else {
        console.log('advertisements table already exists');
      }
    } else {
      console.log('Successfully created advertisements table');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up Supabase tables:', error);
    return false;
  }
}

/**
 * Creates an admin user if one doesn't already exist
 */
export async function createDefaultAdminUser() {
  try {
    // Check if we can connect to Supabase
    const { error: healthError } = await supabase.from('profiles').select('count(*)');
    
    if (healthError) {
      console.warn('Cannot connect to Supabase, skipping admin user creation:', healthError.message);
      return false;
    }
    
    // Check if admin user already exists in auth
    const { data: existingUser, error: userError } = await supabase.auth.signInWithPassword({
      email: 'admin@demo.com',
      password: 'admin123',
    });
    
    // If admin exists and login works, we're done
    if (existingUser?.user) {
      console.log('Admin user already exists');
      
      // Make sure the user is marked as admin
      await ensureUserIsAdmin(existingUser.user);
      
      // Sign out automatically so we don't stay logged in
      await supabase.auth.signOut();
      
      return true;
    }
    
    // Admin doesn't exist or can't login, create new admin
    const { data: newUser, error: createError } = await supabase.auth.signUp({
      email: 'admin@demo.com',
      password: 'admin123',
      options: {
        data: {
          username: 'Admin',
          isAdmin: true
        }
      }
    });
    
    if (createError || !newUser.user) {
      console.error('Error creating admin user:', createError?.message || 'Unknown error');
      return false;
    }
    
    console.log('Successfully created admin user');
    
    // Add user to admin_users table
    await ensureUserIsAdmin(newUser.user);
    
    // Create profile for admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        username: 'Admin',
        email: 'admin@demo.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (profileError) {
      console.error('Error creating admin profile:', profileError.message);
    } else {
      console.log('Successfully created admin profile');
    }
    
    // Sign out automatically so we don't stay logged in
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
}

/**
 * Ensures a user is marked as admin in admin_users table
 */
async function ensureUserIsAdmin(user: User) {
  try {
    // Check if user is already in admin_users table
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (checkError && !checkError.message.includes('No rows found')) {
      console.error('Error checking if user is admin:', checkError.message);
      return false;
    }
    
    // If admin_users entry doesn't exist, create it
    if (!existingAdmin) {
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: user.id,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error setting user as admin:', insertError.message);
        return false;
      }
      
      console.log('Successfully marked user as admin');
    } else {
      console.log('User is already an admin');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring user is admin:', error);
    return false;
  }
}