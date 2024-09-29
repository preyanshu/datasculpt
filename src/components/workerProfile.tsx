"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
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
import { Tabs } from "@/components/ui/tabs";
import ExpandableCard from "./blocks/expandable-card-worker";
import { useCreatorData } from "@/context/creatorContext";
import { AptosClient } from "aptos";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import Register from "./Register";
import { Button } from "./ui/button";
import Withdraw from "./Wthdraw";
import { toast } from "react-toastify";

const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

const moduleAddress =
  "0x3345aa79df67a6e958da1693380a2bbef9882fc309da10564bcbe6dcdcf0d801";

export function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900  flex-1  mx-auto border border-neutral-200 dark:border-neutral-800 overflow-hidden",
        "h-screen w-screen"
      )}
    >
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <>
              <Logo />
            </>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "John Doe",
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
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Acet
      </motion.span>
    </Link>
  );
};

// Worker-specific mock data
const workerProfile = {
  name: "John Doe",
  profilePic: "https://assets.aceternity.com/manu.png",
  walletAddress: "0x1234abcd5678efgh",
  reputation: 4.8,
  totalTasksCompleted: 50,
  accountBalance: 125.5, // in Apt
};

const completedTasks = [
  {
    id: 1,
    title: "Task 1",
    description:
      "What is your favorite color? https://example.com/cat.jpg ghvhgvbjhvj ",
    payment: 50,
    responses: [
      [
        "Red",
        "Bluettps://example.com/cat.jpgttps://example.com/cat.jpgttps://example.com/cat.jpg",
      ],
      ["Green", "Red", "Red", "Blue"],
    ],
  },
  {
    id: 2,
    title: "Task 2",
    description: "What is your favorite animal?",
    payment: 75,
    responses: [
      ["Dog", "Cat"],
      ["https://example.com/cat.jpg", "https://example.com/cat.jpg"],
    ],
  },
];

const Dashboard = () => {
  const { creatorData, setCreatorData } = useCreatorData();
  const [open, setOpen] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const { account, connected, signAndSubmitTransaction } = useWallet();
  console.log(creatorData);

  const withdraw = async () => {
    if (!account) {
      console.log("connect your wallet");
      return [];
    } 
    setLoading(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::user_registry::withdraw_balance`,
        functionArguments: [withdrawAmount],
      }
    }
    try {
      const response = await signAndSubmitTransaction(transaction);
      console.log("Withdraw.", response)
      await client.waitForTransaction(response.hash);
      setLoading(false);
      toast.success("Withdrawal Successful");
    } catch (error) {
      console.log(error)
      setLoading(false);
      toast.error("Withdrawal Failed");
    }
  }

  const getUserProfile = async (address: string | undefined) => {
    if (!address) {
      console.log("Address is not valid");
      return null;
    }
    setLoading(true); 
    const payload = {
      function: `${moduleAddress}::user_registry::get_user_profile`,
      type_arguments: [],
      arguments: [address],
    };
    try {
      const userData = await client.view(payload);
      console.log(userData);
      setLoading(false);
      return userData;
    } catch (error) {
      console.log(error);
      setLoading(false);
      return null;
    }
  };
  useEffect(() => {
    if (connected && creatorData === null) {
      getUserProfile(account?.address).then((res) => {
        console.log(res);
        setCreatorData(res ? res[0]: null);
        if(res === null)handleOpen();
      });
    }
  }, [account, open]);

  const tabs = [
    {
      title: "Completed Tasks",
      value: "completed",
      content: (
        <div
          className="w-full overflow-hidden relative h-[600px] rounded-2xl p-10 text-white bg-neutral-800"
          style={{ marginTop: "-100px" }}
        >
          {completedTasks.length > 0 ? (
            <ul className="space-y-4">
              <ExpandableCard completedTasks={completedTasks} />
            </ul>
          ) : (
            <p className="text-neutral-600 dark:text-neutral-300">
              No completed tasks found.
            </p>
          )}
        </div>
      ),
    },
  ];

  if(loading){
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <img src="/assets/loading.gif" alt="" className="h-[80px]" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-semibold text-center">
          Connect your wallet to proceed
        </h1>
      </div>
    );
  } else if (!creatorData) {
    return (
      <div className="flex gap-3 flex-col items-center justify-center h-full">
        {/* <h1 className="text-3xl font-semibold text-center">
          Please register to proceed....
        </h1>
        <Button color="primary" className="hover:pointer" onClick={handleOpen}>
           Register
       </Button> */}
        <Register open={open} setOpen={setOpen} user={"worker"} />
      </div>
    );
  }

  if(creatorData?.role === "1"){
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-semibold text-center">
          You are a Creator. Please switch to Worker to proceed
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-4 md:p-10">
      {/* Worker Profile Section */}
      <div className="w-full max-w-4xl bg-gray-100 dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-6 mt-20">
        <div className="flex items-center">
          {/* Profile Picture */}
          <Image
            src={workerProfile.profilePic}
            alt="Profile Picture"
            width={100}
            height={100}
            className="rounded-full border-4 border-blue-500"
          />
          {/* Profile Info */}
          <div className="ml-6">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {creatorData.name}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-400">
                Wallet:
              </span>{" "}
              <span className="text-blue-400">
                {creatorData.wallet_address}
              </span>
            </p>
            <div className="flex gap-6">
              {/* Reputation */}
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-400 font-medium">
                  Reputation:
                </span>{" "}
                <span className="text-yellow-400">
                  {creatorData.reputation_points}
                </span>
              </div>
              {/* Total Tasks */}
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-400 font-medium">
                  Total Tasks Completed:
                </span>{" "}
                <span className="text-green-400">
                  {workerProfile.totalTasksCompleted}
                </span>
              </div>
              {/* Account Balance */}
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-400 font-medium">
                  Account Balance:
                </span>{" "}
                <span className="text-blue-400">
                  {creatorData.balance/1e8} Apt
                </span>
              </div>
            </div>
          </div>
          {/* Withdraw Button */}
          <button className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all" onClick={() => setOpenWithdraw(true)}>
            Withdraw
          </button>
          {openWithdraw && <Withdraw openWithdraw={openWithdraw} setOpenWithdraw={setOpenWithdraw} withdrawAmount={withdrawAmount} setWithdrawAmount={setWithdrawAmount} withdrawFunds={withdraw}/>}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-4xl">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};
export default Dashboard;
