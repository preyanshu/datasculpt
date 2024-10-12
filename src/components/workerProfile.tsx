"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { useToast } from "./ui/use-toast";
import { address, data, filter, map } from "framer-motion/client";
import { title } from "process";
import { description } from "./taskExtracted";
import { log } from "console";

const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

const moduleAddress =
  "0x57bbd67464830f3ea4464b4e2e20de137a42e0eb5c44f12e602261e6ec1a6c0f";

function convertTaskData(inputArray, currentAddress) {
  console.log(inputArray, "inp");
  return inputArray.flatMap((item) =>
    item.tasks
      // .filter((task) => task.picked_by.includes(currentAddress)) 
      .map((task) => ({
        id: parseInt(item.jobId), // Convert jobId to number for id
        title: `Job ${item.jobId} Task ${task.task_id}`, // Use task_id for title
        description: task.question, // Use the question for description
        responses: task.task_answers, // Directly map task_answers to responses
      }))
  );
}

// Worker-specific mock data
const workerProfile = {
  name: "John Doe",
  profilePic: "https://assets.aceternity.com/manu.png",
  walletAddress: "0x1234abcd5678efgh",
  reputation: 4.8,
  totalTasksCompleted: 50,
  accountBalance: 125.5, // in Apt
};

const Dashboard = () => {
  const { creatorData, setCreatorData } = useCreatorData();
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<Array<any>>([]);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [completedTasks, setCompletedTasks] = useState<Array<any>>([]);
  const { toast } = useToast();
  const [prevState, setPrevState] = useState<Array<any>>([]);
  let currIdxRef = useRef(-1);
  // useEffect(() => {
  //   const allCompletedTasks = convertTaskData(jobs, account?.address);
  //   // Get the last 10 completed tasks
  //   setCompletedTasks(allCompletedTasks); // Use slice to get the last 10 tasks
  // }, [jobs, account?.address]);
  const handleOpen = () => setOpen(true);
  // console.log(creatorData);

  const currentJobIndexRef = useRef(0);
  const currentTaskIndexRef = useRef(0);
  const maxJobsRef = useRef(0);

  // Main function to fetch jobs and tasks
  const getJobs = async (direction: "next" | "previous") => {
    if (!account) return [];
    setLoadingJob(true);

    console.log(currentJobIndexRef.current, Number(maxJobsRef.current), "Number equal")
    
    try {
      const jobResource = await client.getAccountResource(
        "0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6",
        `${moduleAddress}::job_management::JobManagement`
      );
  
      const jobHandle = (jobResource as any).data.jobs.handle;
      const jobCounter = (jobResource as any).data.job_counter;
  
      if (jobCounter === 0) {
        setJobs([]);
        return;
      }
      console.log("first", currIdxRef.current);
      let totalFetchedTasks = 0;
      let allJobs = [];
      maxJobsRef.current = jobCounter;
  
      let jobIndex = currentJobIndexRef.current; // Get current job index from ref
      let taskIndex = currentTaskIndexRef.current; // Get current task index from ref
  
      if (direction === "next") {
        console.log(Number(maxJobsRef.current) === currentJobIndexRef.current, "maxJobs");
        // Check if there is already cached data in prevState
        if (prevState.length > currIdxRef.current+1) {
            setCompletedTasks(prevState[currIdxRef.current+1]);
            currIdxRef.current++;
            console.log(currIdxRef.current, "next")
            setLoadingJob(false); // Set loading false because we already have the data
            return;
        }
        // Otherwise, fetch new data
        jobIndex = currentJobIndexRef.current;
        taskIndex = currentTaskIndexRef.current;
    
    } else if (direction === "previous") {        
        // Ensure we don't go below the first index
        const newIdx = currIdxRef.current > 0 ? currIdxRef.current - 1 : 0;
        setCompletedTasks(prevState[newIdx]); // Fetch the previous state
        currIdxRef.current = newIdx; // Update the current index
        setLoadingJob(false);
        console.log("previous", currIdxRef.current, prevState[currIdxRef.current]);
        return;
    }
  
      let ans = [];
      // Continue fetching tasks until we meet the batch size and filter tasks
      while (jobIndex < jobCounter && ans.length < 4) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::job_management::Job`,
          key: `${jobIndex + 1}`,
        };
        const job = await client.getTableItem(jobHandle, tableItem);
  
        const taskHandle = job.tasks.handle;
        const taskCounter = job.task_counter;
  
        // Calculate the number of tasks to fetch from this job
        const remainingTasksInJob = taskCounter - taskIndex;
        const tasksNeeded = 4 - ans.length;

        // Fetch tasks starting from the last fetched task index, but not more than needed
        const tasksToFetch = Math.min(remainingTasksInJob, tasksNeeded);
        
        // Fetch tasks starting from the last fetched task index
        const taskFetchPromises = Array.from(
          { length: tasksToFetch },
          (_, index) => {
            const taskItem = {
              key_type: "u64",
              value_type: `${moduleAddress}::job_management::Task`,
              key: `${taskIndex + index + 1}`,
            };
            return client.getTableItem(taskHandle, taskItem);
          }
        );
  
        const tasks = await Promise.all(taskFetchPromises);
        totalFetchedTasks += tasks.length;
  
        // Push job data with tasks into allJobs array
        allJobs.push({
          creator: job.creator,
          jobId: job.job_id,
          taskCounter: job.task_counter,
          tasks: tasks,
          amount: job.amount,
        });
  
        // Filter tasks based on the condition
        ans = convertTaskData(allJobs, account?.address);
  
        // If no valid tasks found, fetch from the next job
        taskIndex += tasksToFetch;
        if (taskIndex >= taskCounter) {
          jobIndex++; // Move to the next job
          taskIndex = 0; // Reset task index for the new job
        }
  
        // Handle out-of-bounds taskIndex if previous was requested
        if (taskIndex < 0) taskIndex = 0;
  
        currentJobIndexRef.current = jobIndex; // Update the current job index in the ref
        currentTaskIndexRef.current = taskIndex; // Update the current task index in the ref
      }
  
      // If there are filtered tasks, append the fetched jobs
      if (ans.length >= 0) {
        setCompletedTasks(ans);        
        // Use function form of setState to ensure latest prevState is used
        setPrevState((prev) => [...prevState, ans]);
        currIdxRef.current = prevState.length;
        console.log("next", currIdxRef.current);
      }
  
      console.log(ans, "ans");
      setJobs((prev) => [...prev, allJobs]);
      console.log("Fetched jobs and tasks:", allJobs);
      console.log(jobIndex, taskIndex, "jobIndex, taskIndex");
      // console.log(completedTasks, "completedTasks");
      setLoadingJob(false);
    } catch (error) {
      console.error(error);
      setLoadingJob(false);
    }
  };
  

  const withdraw = async () => {
    if (!account) {
      console.log("connect your wallet");
      return [];
    }
    // setLoading(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::user_registry::withdraw_balance`,
        functionArguments: [withdrawAmount],
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      console.log("Withdraw.", response);
      await client.waitForTransaction(response.hash);
      // setLoading(false);
      await getUserProfile(account?.address).then((res) => {
        console.log(res);
        setCreatorData(res ? res[0] : null);
      });
      toast({ title: "Success", description: "Withdrawal Successful" });
    } catch (error) {
      console.log(error);
      // setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Withdrawal Failed",
      });
    }
  };

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
    if (connected) {
      getUserProfile(account?.address).then((res) => {
        console.log(res);
        setCreatorData(res ? res[0] : null);
        if (res === null) handleOpen();
      });
    }
    if (jobs.length === 0) getJobs("next");
  }, [account, open]);

  const tabs = [
    {
      title: "Completed Tasks",
      value: "completed",
      content: (
        <>
          <div
            className="w-full overflow-hidden relative h-[480px] rounded-2xl p-10 text-white bg-neutral-800"
            style={{
              marginTop: "-100px",
              marginBottom: "30px",
              overflowY: "scroll",
            }}
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
          <div className="w-full flex">
            <button className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all" disabled={currIdxRef.current === 0} onClick={() => getJobs('previous')}>previous</button>
            <button className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all" disabled={currentJobIndexRef.current == Number(maxJobsRef.current)} onClick={() => getJobs('next')}>next</button>
          </div>
          <div className="h-[40px]"></div>
        </>
      ),
    },
  ];

  if (loading) {
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

  if (creatorData?.role === "1") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-semibold text-center">
          You are a Creator. Please switch to Worker to proceed
        </h1>
      </div>
    );
  }
  console.log(prevState)
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
                  {creatorData.balance / 1e8} Apt
                </span>
              </div>
            </div>
          </div>
          {/* Withdraw Button */}
          <button
            className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all"
            onClick={() => setOpenWithdraw(true)}
          >
            Withdraw
          </button>
          {openWithdraw && (
            <Withdraw
              openWithdraw={openWithdraw}
              setOpenWithdraw={setOpenWithdraw}
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              withdrawFunds={withdraw}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      {!loadingJob ? (
        <div className="w-full max-w-4xl">
          <Tabs tabs={tabs} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <img src="/assets/loading.gif" alt="" className="h-[80px]" />
        </div>
      )}
    </div>
  );
};
export default Dashboard;
