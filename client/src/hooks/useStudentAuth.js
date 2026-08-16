import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../helper/Auth';

/**
 * Client-side auth hook for student-protected pages.
 * Redirects to / if not authenticated.
 * Returns { loading, authenticated }.
 */
export default function useStudentAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = isAuthenticated();
    if (!token) {
      router.replace({
        pathname: '/',
        query: { redirect: router.asPath },
      });
    } else {
      setAuthenticated(true);
      setLoading(false);
    }
  }, [router]);

  return { loading, authenticated };
}
