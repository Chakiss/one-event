import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('=== App: Application loaded ===');
    console.log('Current URL:', window.location.href);
    console.log('Cookies:', document.cookie);
    console.log('localStorage auth_token:', localStorage.getItem('auth_token'));
  }, []);

  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
