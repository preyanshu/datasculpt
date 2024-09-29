"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import ExpandableCard from "./blocks/expandable-card-demo-standard";
import { useCreatorData } from "@/context/creatorContext";
import { AptosClient } from "aptos";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import Register from "./Register";
import { Button } from "./ui/button";

const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

const moduleAddress =
  "0x3345aa79df67a6e958da1693380a2bbef9882fc309da10564bcbe6dcdcf0d801";

// Convert the old structure to the new one
const convertToNewStructure = (oldJobs) => {
  return oldJobs.map((job) => ({
    id: parseInt(job.jobId), // Convert jobId to integer for the new structure
    title: `Job ${job.jobId}`, // Creating a title based on jobId
    status: job.tasks.some((task) => task.completed) ? "completed" : "pending", // Determine status based on task completion
    description: `Details about Job ${job.jobId}`, // Description based on jobId
    payment: job.amount, // Assuming payment is not provided in the old structure; can be modified as needed
    tasks: job.tasks.map((task) => ({
      taskId: parseInt(task.task_id), // Convert task_id to integer
      title: task.question, // Using the question as the title
      maxWorkers: parseInt(task.max_workers), // Convert max_workers to integer
      completedWorkers: task.completed ? 1 : 0, // Assuming 1 completed worker if the task is completed
    })),
  }));
};

const Dashboard = () => {
  const { creatorData, jobs, setJobs, setCreatorData } = useCreatorData();
  const { account, connected } = useWallet();
  const [creator, setCreator] = useState({
    name: "",
    profilePic: "",
    walletAddress: "",
    totalJobsCreated: 0,
    totalJobsPending: 0,
    totalJobsCompleted: 0,
  });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpen = () => setOpen(true);

  const getJobs = async () => {
    if (!account) return [];
    setLoading(true);
    try {
      // Fetch the JobManagement resource for the given account
      const jobResource = await client.getAccountResource(
        "0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6",
        `${moduleAddress}::job_management::JobManagement`
      );

      const jobHandle = (jobResource as any).data.jobs.handle;
      const jobCounter = (jobResource as any).data.job_counter;

      if (jobCounter === 0) {
        setJobs([]); // No jobs, so early return
        return;
      }

      // Create an array of job fetch promises
      const jobFetchPromises = Array.from(
        { length: jobCounter },
        (_, index) => {
          const tableItem = {
            key_type: "u64",
            value_type: `${moduleAddress}::job_management::Job`,
            key: `${index + 1}`,
          };
          return client.getTableItem(jobHandle, tableItem);
        }
      );

      // Fetch all jobs concurrently
      const jobs = await Promise.all(jobFetchPromises);
      // console.log(jobs);
      // Fetch tasks for each job concurrently
      const jobTaskFetchPromises = jobs.map(async (job) => {
        const taskHandle = job.tasks.handle;
        const taskCounter = job.task_counter;

        // Create an array of task fetch promises for each job
        const taskFetchPromises = Array.from(
          { length: taskCounter },
          (_, index) => {
            const tableItem = {
              key_type: "u64",
              value_type: `${moduleAddress}::job_management::Task`,
              key: `${index + 1}`,
            };
            return client.getTableItem(taskHandle, tableItem);
          }
        );

        // Fetch all tasks for the job concurrently
        const tasks = await Promise.all(taskFetchPromises);

        // Return a new job with tasks
        return {
          creator: job.creator,
          jobId: job.job_id,
          taskCounter: job.task_counter,
          tasks: tasks,
          amount: job.amount,
        };
      });

      // Resolve all job and task fetch promises
      const newJobs = await Promise.all(jobTaskFetchPromises);
      console.log(newJobs);
      setLoading(false);
      // Set the jobs in state
      setJobs(newJobs);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getUserProfile = async (address: string | undefined) => {
    if (!address) {
      console.log("Address is not valid");
      return null;
    }
    const payload = {
      function: `${moduleAddress}::user_registry::get_user_profile`,
      type_arguments: [],
      arguments: [address],
    };
    try {
      const userData = await client.view(payload);
      console.log(userData);
      return userData;
    } catch (error) {
      console.log(error);
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
    if(jobs.length === 0)
      getJobs();
  }, [account, connected])

  useEffect(() => {
    // Convert jobs to the new structure
    const newJobs = convertToNewStructure(jobs || []);
    
    // Calculate total jobs created, pending, and completed
    const totalJobsCreated = newJobs.length;
    const totalJobsPending = newJobs.filter((job) => job.status === "pending").length;
    const totalJobsCompleted = newJobs.filter((job) => job.status === "completed").length;

    setCreator((prev) => ({
      ...prev,
      name: creatorData?.name || "",
      profilePic: "",
      walletAddress: creatorData?.wallet_address || "",
      totalJobsCreated,
      totalJobsPending,
      totalJobsCompleted,
    }));
  }, [creatorData, jobs]); // Recalculate whenever creatorData or jobs change

  // Convert jobs to new structure again for filtering
  const newJobs = convertToNewStructure(jobs || []);
  const pendingJobs = newJobs.filter((job) => job.status === "pending");
  const completedJobs = newJobs.filter((job) => job.status === "completed");

  const tabs = [
    {
      title: "Pending Jobs",
      value: "pending",
      content: (
        <div
          className="w-full overflow-hidden relative h-[600px] rounded-2xl p-10 text-white bg-neutral-800"
          style={{ marginTop: "-100px" }}
        >
          {pendingJobs.length > 0 ? (
            <ul className="space-y-4">
              <ExpandableCard jobs={pendingJobs} />
            </ul>
          ) : (
            <p className="text-neutral-600 dark:text-neutral-300">No pending jobs found.</p>
          )}
        </div>
      ),
    },
    {
      title: "Completed Jobs",
      value: "completed",
      content: (
        <div
          className="w-full overflow-hidden relative h-[600px] rounded-2xl p-10 text-white bg-neutral-800"
          style={{ marginTop: "-100px" }}
        >
          {completedJobs.length > 0 ? (
            <ul className="space-y-4">
              <ExpandableCard jobs={completedJobs} />
            </ul>
          ) : (
            <p className="text-neutral-600 dark:text-neutral-300">No completed jobs found.</p>
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
        <Register open={open} setOpen={setOpen} user={"creator"} />
      </div>
    );
  }

  if(creatorData?.role === "2"){
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-semibold text-center">
          You are a Worker. Please switch to Creator to proceed
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-4 md:p-10">
      {/* Creator Details */}
      <div className="w-full max-w-4xl bg-gray-100 dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-6 mt-20">
        <div className="flex items-center space-x-4">
          <Image
            src={creator?.profilePic ? creator.profilePic : "https://assets.aceternity.com/manu.png"}
            alt="Profile Picture"
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{creator.name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Wallet: {creator.walletAddress}
            </p>
            <div className="flex gap-4 mt-2">
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <strong>Total Jobs Created:</strong> {creator.totalJobsCreated}
              </div>
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <strong>Total Jobs Pending:</strong> {creator.totalJobsPending}
              </div>
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <strong>Total Jobs Completed:</strong> {creator.totalJobsCompleted}
              </div>
            </div>
          </div>
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
