"use client";

import { useAuth } from "../context/AuthContext";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { usePathname } from 'next/navigation';
import { useGlobalLoader } from "../context/GlobalLoaderContext";
import GlobalLoader from "./GlobalLoader";
import { useEffect } from 'react';
import Lottie from "lottie-react";
import animationData from "../public/BGanimation.json";

export default function ClientLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: navIsLoading, setIsLoading: setNavIsLoading } = useGlobalLoader();
  const pathname = usePathname();

  useEffect(() => {
    // This effect ensures the loader is turned off after a navigation is complete.
    // It's triggered when the pathname changes.
    if (navIsLoading) {
      setNavIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Combine the initial authentication loading state with the navigation loading state.
  const isAppLoading = authLoading || navIsLoading;

  const isLoginPage = pathname === "/login";
  // Determine if nav/footer should be shown AFTER loading is complete.
  const showNavAndFooter = !isLoginPage && !authLoading && user;
  const isHomePageUnauthed = pathname === '/' && !user && !authLoading;

  const showBackground = pathname !== '/';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {showBackground && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          overflow: 'hidden',
        }}>
          <Lottie animationData={animationData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
          }}/>
        </div>
      )}
      {isAppLoading && <GlobalLoader />}

      <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
          filter: navIsLoading ? 'blur(4px)' : 'none',
          visibility: authLoading ? 'hidden' : 'visible',
          transition: 'filter 0.2s linear, visibility 0s',
          pointerEvents: isAppLoading ? 'none' : 'auto',
          backgroundColor: showBackground ? 'transparent' : 'var(--background)'
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