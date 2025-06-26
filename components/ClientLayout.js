"use client";

import { useAuth } from "../context/AuthContext";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't render NavBar and Footer on the login page
  const isLoginPage = pathname === "/login";

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {!isLoginPage && !loading && user && <NavBar />}
      <main style={{ 
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '64px'
      }}>
        {children}
      </main>
      {!isLoginPage && !loading && user && <Footer />}
    </div>
  );
}