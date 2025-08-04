
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('useProfile: No user found');
      setProfile(null);
      setLoading(false);
      return;
    }

    console.log('useProfile: User found, fetching profile for user:', user.id);

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        console.log('useProfile: Profile fetched:', data);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const isAdmin = profile?.role === 'admin';
  const isActive = profile?.is_active === true;

  console.log('useProfile: Current state:', {
    profileExists: !!profile,
    role: profile?.role,
    profileIsActive: profile?.is_active,
    isAdmin,
    isActive: isActive
  });

  return {
    profile,
    loading,
    isAdmin,
    isActive,
  };
}
