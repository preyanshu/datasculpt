"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { AptosClient } from "aptos";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";


const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

const moduleAddress = "0x57bbd67464830f3ea4464b4e2e20de137a42e0eb5c44f12e602261e6ec1a6c0f"
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { CreatorProvider } from "@/context/creatorContext";
import Header from "@/components/Header";
import { MoveValue } from "@aptos-labs/ts-sdk";

const links = [
  {
    label: "Dashboard",
    href: "/worker/tasks",
    icon: (
      <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Profile",
    href: "/worker/profile",
    icon: (
      <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
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
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <>
         
        
          <Header />
          <CreatorProvider>
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
                      label: "Manu Arora",
                      href: "#",
                      icon: (
                        <Image
                          src="https://assets.aceternity.com/manu.png"
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
                            <dotlottie-player src="https://lottie.host/375e2e48-5819-4d6d-a691-6eada5678aae/ljUkjBwWMB.json" background="transparent" speed="1" style={{width: "250px", height: "250px"}} direction="1" playMode="normal" autoplay></dotlottie-player>
                        
                      <h1 className="text-3xl font-semibold text-center">
                      🛠️ <b>Wallet needed!</b> <br/>
                      <span className="text-xl ml-[30px]">Connect it and you're all set!</span>
                      </h1>
                  </div>
                )}
              </main>
            </div>
          </CreatorProvider>
        
       </>
  );
}
