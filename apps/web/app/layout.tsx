import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "../components/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Allowbox - School Management System",
  description: "Multi-tenant SaaS platform for school management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Set initial theme before hydration to avoid flash of incorrect theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try {
                var stored = localStorage.getItem('theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = stored || (prefersDark ? 'dark' : 'light');
                if (theme === 'dark') { document.documentElement.classList.add('dark'); }
              } catch (e) { /* ignore */ }
            })();
          `}}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
