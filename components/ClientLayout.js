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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Render the GlobalLoader if the app is in any loading state */}
      {isAppLoading && <GlobalLoader />}

      <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
          // Blur the content only during page-to-page navigation.
          filter: navIsLoading ? 'blur(4px)' : 'none',
          // Hide the main content during the initial auth load to prevent seeing page-specific loaders.
          visibility: authLoading ? 'hidden' : 'visible',
          transition: 'filter 0.2s linear, visibility 0s',
          pointerEvents: isAppLoading ? 'none' : 'auto',
      }}>
        {(showNavAndFooter || isHomePageUnauthed) && <NavBar />}
        <main style={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: (showNavAndFooter || isHomePageUnauthed) ? '64px' : '0'
        }}>
          {/* The children are always rendered so contexts work, but they are hidden by the parent div's visibility style during initial load. */}
          {children}
        </main>
        {(showNavAndFooter || isHomePageUnauthed) && <Footer />}
      </div>
    </div>
  );
}