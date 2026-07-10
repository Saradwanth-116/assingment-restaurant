import { useEffect, useState } from "react";

export type AppRole = "admin" | "user";

interface User {
  id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setUser({ id: data._id, email: data.email, name: data.name });
            setRole(data.role as AppRole);
          }
        } else {
          // invalid token
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.error("Auth fetch error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();
    
    // Add event listener to handle login/logout across tabs or from components
    const handleStorageChange = () => fetchUser();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  return { user, role, loading };
}
