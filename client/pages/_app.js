import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, Slide } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Head from 'next/head';
import theme from '../src/theme';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

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
