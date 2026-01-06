import { useAuth } from "../context/AuthContext";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useLocation } from 'react-router-dom';
import { useGlobalLoader } from "../context/GlobalLoaderContext";
import GlobalLoader from "./GlobalLoader";
import { useEffect } from 'react';

export default function ClientLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: navIsLoading, setIsLoading: setNavIsLoading } = useGlobalLoader();
  const location = useLocation();
  const pathname = location.pathname;

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
      {isAppLoading && <GlobalLoader />}

      <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
          filter: navIsLoading ? 'blur(4px)' : 'none',
          visibility: authLoading ? 'hidden' : 'visible',
          transition: 'filter 0.2s linear, visibility 0s',
          pointerEvents: isAppLoading ? 'none' : 'auto',
          backgroundColor: 'var(--background)'
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
