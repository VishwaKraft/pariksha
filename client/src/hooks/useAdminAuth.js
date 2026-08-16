import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticatedAdmin } from '../helper/Auth';

/**
 * Client-side auth hook for admin-protected pages.
 * Redirects to /admin if not authenticated.
 * Returns { loading, authenticated }.
 */
export default function useAdminAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = isAuthenticatedAdmin();
    if (!token) {
      router.replace('/admin');
    } else {
      setAuthenticated(true);
      setLoading(false);
    }
  }, [router]);

  return { loading, authenticated };
}
