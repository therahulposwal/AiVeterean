// web/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for Token
    const storedToken = localStorage.getItem('veteran_token');
    
    if (!storedToken) {
      // 2. If missing, Redirect
      router.push('/login');
    } else {
      // 3. If present, Allow Access
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, [router]);

  return { isAuthenticated, token };
}