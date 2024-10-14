'use client'
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconUserBolt,
} from "@tabler/icons-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
// import { CreatorProvider } from "@/context/creatorContext";
import Header from "@/components/header";
import { useCreatorData } from "@/context/context";

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
  const {creatorData} = useCreatorData();

  // State to store the avatar URL
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Function to generate the avatar URL

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
                  label: " " + (creatorData?.name || "--"),
                  href: "#",
                  icon: (
                    <Image
                      src={getAvatar()} // Use the avatar URL from state
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
          <main className="flex-1 " style={{ overflowY: "auto" }}>
            {connected ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <dotlottie-player
                  src="https://lottie.host/375e2e48-5819-4d6d-a691-6eada5678aae/ljUkjBwWMB.json"
                  background="transparent"
                  speed="1"
                  style={{ width: "250px", height: "250px" }}
                  direction="1"
                  playMode="normal"
                  autoplay
                ></dotlottie-player>
                <h1 className="text-3xl text-center">
                  <b>Wallet needed!</b> <br />
                </h1>
              </div>
            )}
          </main>
        </div>
      
    </>
  );
}
