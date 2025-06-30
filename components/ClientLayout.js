"use client";

import { useAuth } from "../context/AuthContext";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { usePathname } from 'next/navigation';
import { useGlobalLoader } from "../context/GlobalLoaderContext";
import GlobalLoader from "./GlobalLoader";
import { useEffect } from 'react';

export default function ClientLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading, setIsLoading } = useGlobalLoader();
  const pathname = usePathname();

  // Hide loader whenever path changes (navigation is complete)
  // This also handles browser back/forward and direct URL navigation.
  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isLoginPage = pathname === "/login";
  const showNavAndFooter = !isLoginPage && !authLoading && user;
  const isHomePageUnauthed = pathname === '/' && !user;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {isLoading && <GlobalLoader />}
      <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
          filter: isLoading ? 'blur(4px)' : 'none',
          transition: 'filter 0.2s linear',
          pointerEvents: isLoading ? 'none' : 'auto',
      }}>
        {(showNavAndFooter || isHomePageUnauthed) && <NavBar />}
        <main style={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: (showNavAndFooter || isHomePageUnauthed) ? '64px' : '0'
        }}>
          {children}
        </main>
        {(showNavAndFooter || isHomePageUnauthed) && <Footer />}
      </div>
    </div>
  );
}