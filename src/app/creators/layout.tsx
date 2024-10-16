"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/themeProvider";
import "../globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { CreatorProvider } from "@/context/context";
import Header from "@/components/header";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useCreatorData } from "@/context/context";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

const links = [
  {
    label: "Dashboard",
    href: "/creators/tasks",
    icon: (
      <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Profile",
    href: "/creators/profile",
    icon: (
      <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  }
];

const Logo = () => (
  <Link
    href="/"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-black dark:text-white whitespace-pre"
    >
      DataSculpt
    </motion.span>
  </Link>
);



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const { connected } = useWallet();
  const { creatorData } = useCreatorData();

  const getAvatar = () => {

    if (creatorData?.name) {
      // Generate placeholder avatar using the first letter of the name
      const firstLetter = creatorData.name.charAt(0).toUpperCase();
      return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=fff&size=128`;
    }
  
    // Fallback URL for an anonymous user (if name is missing)
    return "https://ui-avatars.com/api/?name=.&background=fff&color=fff&size=128";
  };

  return (
   <>
       
          <Header />
          
          <div className="rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900 flex-1 mx-auto border border-neutral-200 dark:border-neutral-800 overflow-hidden h-screen w-screen">
            {/* Sidebar */}
            <Sidebar open={open} setOpen={setOpen} animate={true}>
              <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                  <Logo />
                  <div className="mt-8 flex flex-col gap-2">
                    {links.map((link, idx) => (
                      <SidebarLink key={idx} link={link} />
                    ))}
                  </div>
                </div>
                <SidebarLink
                  link={{
                    label:  " " + (creatorData?.name || "--"), //get this label for creatorprovider from creator data
                    href: "#",
                    icon: (
                      <Image
                        src={getAvatar()}
                        className="h-7 w-7 flex-shrink-0 rounded-full"
                        width={50}
                        height={50}
                        alt="Avatar"
                      />
                    ),
                  }}
                />
              </SidebarBody>
            </Sidebar>
            {/* Content */}
          
            <main className="flex-1 " style={{overflowY:"auto"}}>
            {connected ? (
                 children 
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                  <dotlottie-player src="https://lottie.host/375e2e48-5819-4d6d-a691-6eada5678aae/ljUkjBwWMB.json" background="transparent" speed="1" style={{width: "250px", height: "250px",marginLeft:"0px"}} direction="1" playMode="normal" autoplay></dotlottie-player>
              
            <h1 className="text-3xl  text-center">
             <b>Wallet needed!</b> <br/>
            {/* <span className="text-xl ml-[30px]">Connect it and you're all set!</span> */}
            </h1>
        </div>
                )}
            </main>
           
          </div>
         
      
    </>);
}
