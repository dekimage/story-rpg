import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ReusableLayout from "@/reusable-ui/ReusableLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dejan Gavrilovic",
  description: "portfolio app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <ReusableLayout>{children}</ReusableLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
