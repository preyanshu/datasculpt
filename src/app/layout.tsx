"use client"
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { ModalProvider } from "@/components/ui/animated-modal";
import router, { usePathname } from 'next/navigation';
import style from "styled-jsx/style";
import { CreatorProvider } from "@/context/creatorContext";
import NextNProgress from 'nextjs-progressbar';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

    const isHomePage = pathname === '/';

    console.log(pathname,isHomePage);

  return (
    <html lang="en">
      <body
       className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
        style={{
        overflow: isHomePage ? 'auto' : 'hidden', // Conditionally set overflow
      }}
      >
     
          <CreatorProvider>
          <ModalProvider>
          <WalletProvider>
          <NextNProgress />
            {children}
            <Toaster />
          </WalletProvider>
          </ModalProvider>
          </CreatorProvider>

       

      </body>
      <script
        src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
        type="module"
      ></script>
    </html>
  );
}
