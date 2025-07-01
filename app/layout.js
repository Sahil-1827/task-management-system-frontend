import { AuthProvider } from "../context/AuthContext";
import { ThemeProviderWrapper } from "../context/ThemeContext";
import { ActivityLogProvider } from "../context/ActivityLogContext";
import { NotificationProvider } from "../context/NotificationContext";
import { GlobalLoaderProvider } from "../context/GlobalLoaderContext"; // 1. Import
import ClientLayout from "@/components/ClientLayout";
import { Manrope, Noto_Sans } from "next/font/google";
import "../app/globals.css";
import ThemedToastContainer from '@/components/ThemedToastContainer';
import 'react-toastify/dist/ReactToastify.css';

const manrope = Manrope({ subsets: ["latin"] });
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"]
});

export const metadata = {
  title: "Task Management System",
  description: "Advanced Task Management System with collaboration features"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.className} ${notoSans.className}`}>
        <AuthProvider>
          <ThemeProviderWrapper>
            <GlobalLoaderProvider> {/* 2. Wrap here */}
              <NotificationProvider>
                <ActivityLogProvider>
                  <ClientLayout>{children}</ClientLayout>
                  <ThemedToastContainer />
                </ActivityLogProvider>
              </NotificationProvider>
            </GlobalLoaderProvider> {/* 3. And close here */}
          </ThemeProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}