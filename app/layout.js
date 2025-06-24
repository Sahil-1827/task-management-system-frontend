import { AuthProvider } from "../context/AuthContext";
import { ThemeProviderWrapper } from "../context/ThemeContext";
import { ActivityLogProvider } from "../context/ActivityLogContext";
import { NotificationProvider } from "../context/NotificationContext";
import ClientLayout from "@/components/ClientLayout";
import { Manrope, Noto_Sans } from 'next/font/google';
import "../app/globals.css"

const manrope = Manrope({ subsets: ['latin'] });
const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900']
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
            <ActivityLogProvider>
              <NotificationProvider>
                <ClientLayout>{children}</ClientLayout>
              </NotificationProvider>
            </ActivityLogProvider>
          </ThemeProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}