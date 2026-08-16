import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, Slide } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Head from 'next/head';
import theme from '../src/theme';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

if (typeof window !== 'undefined' && !window.__fetchPatched) {
  window.__fetchPatched = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [resource, config] = args;
    const method = (config && config.method) ? config.method.toUpperCase() : 'GET';
    console.log(`[API Request] ${method} ${resource}`, config || '');
    try {
      const response = await originalFetch(...args);
      if (!response.ok) {
        console.error(`[API Error] ${method} ${resource} failed with status: ${response.status} ${response.statusText}`);
        try {
          const resClone = response.clone();
          const errorData = await resClone.text();
          console.error(`[API Error Response Body]`, errorData);
        } catch (e) {}
      } else {
        console.log(`[API Response] ${method} ${resource} succeeded with status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`[API Network Error] ${method} ${resource}`, error);
      throw error;
    }
  };
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pariksha – Secure Online Exams</title>
      </Head>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        <ThemeProvider theme={theme}>
          <LegacyThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />
          <ToastContainer
            className="impct-toast"
            position="bottom-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnVisibilityChange
            draggable={false}
            pauseOnHover
            transition={Slide}
          />
          </LegacyThemeProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </>
  );
}
