"use client";
import React, { useEffect, useState, useRef, createElement } from "react";
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
import ReactLoading from "react-loading";



import { data, address, pre, div, p, ul, view, button, body, map, style } from "framer-motion/client";
import { get } from "http";
import { type } from "os";
import { join } from "path";


const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

const moduleAddress =
  "0x57bbd67464830f3ea4464b4e2e20de137a42e0eb5c44f12e602261e6ec1a6c0f";

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
  const { creatorData, setCreatorData } = useCreatorData();
  const { account, connected } = useWallet();
  const [creator, setCreator] = useState({
    name: "",
    profilePic: "",
    walletAddress: "",
    totalJobsCreated: 0,
    totalJobsPending: 0,
    totalJobsCompleted: 0,
  });

  const [view, setView] = useState("pending");

  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleOpen = () => setOpen(true);

  const pendingJobIdxRef = useRef(0);
  const completeJobIdxRef = useRef(0);
  const currentTaskIndexRef = useRef(0);
  const [loadingJob, setLoadingJob] = useState(false);
  const [loadingCompleteJob, setLoadingCompleteJob] = useState(false);
  const [prevPending, setPrevPending] = useState<Array<any>>([]);
  const [pendingJobs1, setPendingJobs1] = useState<Array<any>>([]);
  const [prevComplete, setPrevComplete] = useState<Array<any>>([]);
  const [completeJobs1, setCompleteJobs1] = useState<Array<any>>([]);
  let pendingIdxRef = useRef(-1);
  let completeIdxRef = useRef(-1);

  const [loadingAns, setLoadingAns] = useState(false);
  // const [questions, setQuestions] = useState([]);


  const getAnswers = async (jobId : number) => {
    if (!account || !jobId) return [];
    setLoadingAns(true);
  
    try {
      const jobResource = await client.getAccountResource(
        "0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6",
        `${moduleAddress}::job_management::JobManagement`
      );
  
      const jobHandle = (jobResource as any).data.jobs.handle;
      const jobCounter = (jobResource as any).data.job_counter;
  
      if (jobCounter === 0 || jobId > jobCounter) {
        setJobs([]);
        setLoadingAns(false);
        return;
      }
  
      // Fetch job using the provided jobId
      const tableItem = {
        key_type: "u64",
        value_type: `${moduleAddress}::job_management::Job`,
        key: `${jobId}`,
      };
      const job = await client.getTableItem(jobHandle, tableItem);
  
      const taskHandle = job.tasks.handle;
      const taskCounter = job.task_counter;
  
      if (taskCounter === 0) {
        // setQuestions([]);
        // setJobs([]);
        setLoadingAns(false);
        return;
      }
  
      let allTasks = [];
  
      // Fetch all tasks for this job
      const taskFetchPromises = Array.from({ length: taskCounter }, (_, index) => {
        const taskItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::job_management::Task`,
          key: `${index + 1}`,
        };
        return client.getTableItem(taskHandle, taskItem);
      });
  
      const tasks = await Promise.all(taskFetchPromises);
  
      allTasks.push(...tasks);
      console.log(allTasks, "allTasks");

      downloadTasksAsCSV(allTasks);
  
      // Filter tasks based on the condition
  
    
  
     setLoadingAns(false);
    } catch (error) {
      console.error(error);
      setLoadingAns(false);
    }
  };

  const downloadTasksAsCSV = (tasks: any) => {
    // Find the maximum number of options across all tasks
    const maxOptions = tasks.reduce((max, task) => Math.max(max, task.options.length), 0);
  
    // Generate CSV Header
    const headers = ['task_id', 'question'];
    for (let i = 1; i <= maxOptions; i++) {
      headers.push(`option ${i}`);
    }
    headers.push('answer');
  
    // Function to find the most frequent answer in the task_answers array
    const getMostFrequentAnswer = (task_answers) => {
      if (task_answers.length === 0) {
        return 'no answers';
      }
      const answerCount = {};
      task_answers.forEach((answer) => {
        answerCount[answer] = (answerCount[answer] || 0) + 1;
      });
      const mostFrequentAnswer = Object.keys(answerCount).reduce((a, b) =>
        answerCount[a] > answerCount[b] ? a : b
      );
      return mostFrequentAnswer;
    };
  
    // Build CSV rows
    const rows = tasks.map((task) => {
      const mostFrequentAnswer = getMostFrequentAnswer(task.task_answers);
  
      // Create a row starting with task_id and question (wrapped in quotes)
      const row = [
        task.task_id,
        `"${task.question.replace(/"/g, '""')}"`, // Handle double quotes inside question
      ];
  
      // Add options dynamically (wrap each option in quotes, fill in blank if fewer than maxOptions)
      task.options.forEach(option => row.push(`"${option.replace(/"/g, '""')}"`));
      while (row.length < 2 + maxOptions) {
        row.push(''); // Fill empty columns for missing options
      }
  
      // Add the most frequent answer (wrapped in quotes)
      row.push(`"${mostFrequentAnswer.replace(/"/g, '""')}"`);
  
      return row;
    });
  
    // Combine headers and rows into a CSV string
    const csvContent = [
      headers.join(','), // Join headers with commas
      ...rows.map((row) => row.join(',')) // Join each row array with commas
    ].join('\n');
  
    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
    // Create a download link for the Blob
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tasks.csv');
    link.style.visibility = 'hidden';
    
    // Append the link to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  


  useEffect(()=>{
    // getAnswers(5);
    

  },[])
  

  const getPendingJobs = async (direction: "next" | "previous") => {
  if (!account) return [];
  setLoadingJob(true);

  try {
    // Fetch Job Management data from the client
    const jobResource = await client.getAccountResource(
      "0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6",
      `${moduleAddress}::job_management::JobManagement`
    );

    const jobHandle = (jobResource as any).data.jobs.handle;
    const jobCounter = (jobResource as any).data.job_counter;

    // If there are no jobs, reset the jobs state and stop loading
    if (jobCounter === 0) {
      setJobs([]);
      setLoadingJob(false);
      return;
    }

    let jobIndex = pendingJobIdxRef.current; // Get current job index from ref
    const BATCH_SIZE = 4; // Set the batch size to 4 jobs per fetch

    if (direction === "next") {
      console.log(pendingJobIdxRef.current, pendingIdxRef.current, "prevPending inside next");
      // Handle the "next" direction with cached data
      if (prevPending.length > pendingIdxRef.current + 1) {
        // Use cached data if available
        setPendingJobs1(prevPending[pendingIdxRef.current + 1]);
        pendingIdxRef.current++;
        setLoadingJob(false);
        return;
      }
    } else if (direction === "previous") {
      // Handle the "previous" direction with cached data
      const newIdx = pendingIdxRef.current > 0 ? pendingIdxRef.current - 1 : 0;
      console.log(pendingJobIdxRef.current, pendingIdxRef.current, newIdx, prevPending, "prevPending inside prev");
      if (prevPending[newIdx]) {
        // Use cached data for previous jobs
        setPendingJobs1(prevPending[newIdx]);
        pendingIdxRef.current = newIdx;
        setLoadingJob(false);
        return;
      }
    }

    let filteredJobs: any[] = [];
    let fetchedCount = 0; // Keep track of how many jobs we have fetched in this batch

    // Fetch only a batch of jobs (4 jobs per batch)
    while (jobIndex < jobCounter && fetchedCount < BATCH_SIZE) {
      const tableItem = {
        key_type: "u64",
        value_type: `${moduleAddress}::job_management::Job`,
        key: `${jobIndex + 1}`,
      };

      // Fetch each job
      const job = await client.getTableItem(jobHandle, tableItem);

      // Filter jobs based on creator's address and completion status
      if (
        job.creator === account?.address&& 
        job.is_completed === false) {

          console.log(job, "job")
        filteredJobs.push({
          creator: job.creator,
          jobId: job.job_id,
          taskCounter: job.task_counter,
          amount: job.amount,
          isCompleted: job.is_completed,
          tasksPicked: job.task_pick_count,
          maxworkers: "2",
          name : job.job_name || "-"
        });
        fetchedCount++; // Increment the fetched jobs count
      }

      jobIndex++; // Move to the next job
      pendingJobIdxRef.current = jobIndex; // Update the current job index ref
    }
    if (filteredJobs.length > 0) {
      
      console.log("prev",prevPending)
      console.log("curr",filteredJobs)
      setPrevPending((prev) =>{
        console.log(prev, "prev inside setPrevPending");
        console.log("jobcheck", [...prev, filteredJobs])

         return [...prev, filteredJobs]
      });

      // Update current index in prevPending and set the jobs to be displayed
      pendingIdxRef.current = prevPending.length;
      console.log(pendingIdxRef.current, "pendingIdxRef.current");
      setPendingJobs1(filteredJobs);
    }
    setLoadingJob(false); // Stop loading after processing jobs
  } catch (error) {
    console.error(error);
    setLoadingJob(false); // Stop loading in case of an error
  }
};
const handleTabClick = (newView: string) => {
    setView(newView);
  };
const getCompleteJobs = async (direction: "next" | "previous") => {
  if (!account) return [];
  setLoadingCompleteJob(true);

  try {
    // Fetch Job Management data from the client
    const jobResource = await client.getAccountResource(
      "0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6",
      `${moduleAddress}::job_management::JobManagement`
    );

    const jobHandle = (jobResource as any).data.jobs.handle;
    const jobCounter = (jobResource as any).data.job_counter;

    // If there are no jobs, reset the jobs state and stop loading
    if (jobCounter === 0) {
      setJobs([]);
      setLoadingCompleteJob(false);
      return;
    }

    let jobIndex = completeJobIdxRef.current; // Get current job index from ref
    const BATCH_SIZE = 4; // Set the batch size to 4 jobs per fetch

    if (direction === "next") {
      console.log(completeJobIdxRef.current, completeIdxRef.current, "prevPending inside next");
      // Handle the "next" direction with cached data
      if (prevComplete.length > completeIdxRef.current + 1) {
        // Use cached data if available
        setCompleteJobs1(prevComplete[completeIdxRef.current + 1]);
        completeIdxRef.current++;
        setLoadingCompleteJob(false);
        return;
      }
    } else if (direction === "previous") {
      // Handle the "previous" direction with cached data
      const newIdx = completeIdxRef.current > 0 ? completeIdxRef.current - 1 : 0;
     
      if (prevComplete[newIdx]) {
        // Use cached data for previous jobs
        setCompleteJobs1(prevComplete[newIdx]);
        completeIdxRef.current = newIdx;
        setLoadingCompleteJob(false);
        return;
      }
    }

    let filteredJobs: any[] = [];
    let fetchedCount = 0; // Keep track of how many jobs we have fetched in this batch

    // Fetch only a batch of jobs (4 jobs per batch)
    while (jobIndex < jobCounter && fetchedCount < BATCH_SIZE) {
      const tableItem = {
        key_type: "u64",
        value_type: `${moduleAddress}::job_management::Job`,
        key: `${jobIndex + 1}`,
      };

      // Fetch each job
      const job = await client.getTableItem(jobHandle, tableItem);

      // Filter jobs based on creator's address and completion status
      if (
        job.creator === account?.address&& 
        job.is_completed === true) {
        filteredJobs.push({
          creator: job.creator,
          jobId: job.job_id,
          taskCounter: job.task_counter,
          amount: job.amount,
          isCompleted: job.is_completed,
          tasksPicked: job.task_pick_count,
        });
        fetchedCount++; // Increment the fetched jobs count
      }

      jobIndex++; // Move to the next job
      completeJobIdxRef.current = jobIndex; // Update the current job index ref
    }
    if (filteredJobs.length > 0) {
      
      console.log("prev",prevComplete)
      console.log("curr",filteredJobs)
      setPrevComplete((prev) =>{
        console.log(prev, "prev inside setprevComplete");
        console.log("jobcheck", [...prev, filteredJobs])

         return [...prev, filteredJobs]
      });

      // Update current index in prevComplete and set the jobs to be displayed
     completeIdxRef.current = prevComplete.length;
      console.log(completeIdxRef.current, "pendingIdxRef.current");
      setCompleteJobs1(filteredJobs);
    }
    setLoadingCompleteJob(false); // Stop loading after processing jobs
  } catch (error) {
    console.error(error);
    setLoadingCompleteJob(false); // Stop loading in case of an error
  }
};


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
      console.log(jobs);
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
          isCompleted: job.is_completed,
          tasksPicked: job.task_pick_count,
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
    if (connected) {
      getUserProfile(account?.address).then((res) => {
        console.log(res);
        setCreatorData(res ? res[0]: null);
        if(res === null)handleOpen();
      });
    }
   
  }, [account, connected])

  useEffect(() => {
    if(jobs.length === 0 && account){
      getJobs();
      getPendingJobs("next");
      getCompleteJobs("next");
    }
  }, [account,connected]);

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

 
  if(loading){
    return (
      <div className="flex flex-col items-center justify-center h-full">
            <ReactLoading type="spin" color="#fff" height={67} width={67} />
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
  
  console.log(prevPending, prevPending.length, pendingIdxRef.current, pendingJobs1, "prevPending");


  
  const getAvatar = () => {

    if (creatorData?.name) {
      // Generate placeholder avatar using the first letter of the name
      const firstLetter = creatorData.name.charAt(0).toUpperCase();
      return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=fff&size=128`;
    }
  
    // Fallback URL for an anonymous user (if name is missing)
    return "https://ui-avatars.com/api/?name=.&background=fef&color=fff&size=128";
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-4 md:p-10">
      {/* Creator Details */}
      <div className="w-full max-w-4xl bg-gray-100 dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-6 mt-20">
        <div className="flex items-center space-x-4">
          <Image
            src={getAvatar()}
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
      <div className="w-full max-w-4xl ">
        {/* <Tabs tabs={tabs} />  */}
        {/* {
          pendingJobs1.map((job) => {
            return(
              <div> 
                <h1>{job.jobId}</h1>

              </div>
            )
          })
        } */}
        <div className="flex space-x-4 mb-4">
        <div onClick={() => {
          console.log("pending")  
          setView("pending")}} className={`rounded-lg flex justify-center items-center px-4 py-2 cursor-pointer ${view === "completed" ? "text-white" : "bg-[#27272A] text-white"} transition duration-200`} style={{borderRadius:"30px"} }>
          Pending Jobs
        </div>
        <div onClick={() => {
          console.log("pending")  
          setView("completed")}} className={`rounded-lg flex justify-center items-center px-4 py-2 cursor-pointer ${view === "pending" ? "text-white" : "bg-[#27272A] text-white"} transition duration-200`} style={{borderRadius:"30px"} }>
          Completed Jobs
        </div>
      </div>

      {/* Render Jobs based on state */}
      {view === "pending" ? (
        <div className="w-full overflow-hidden relative h-[600px] rounded-2xl p-10 text-white bg-neutral-800">
          <div>
  {loadingJob ? (
    <div className="flex justify-center items-center h-[515px]">
      {/* <p className="text-neutral-600 dark:text-neutral-300">Loading...</p> */}
      <ReactLoading type="spin" color="#fff" height={67} width={67} />
    </div>
  ) : pendingJobs1?.length > 0 ? (
    <ul className="space-y-4">
      <ExpandableCard jobs={pendingJobs1} getAns={getAnswers} loadingAns={loadingAns}/>
    </ul>
  ) : (
    <p className="text-neutral-600 dark:text-neutral-300">
      No pending jobs found.
    </p>
  )}
</div>
        </div>
      ) : (
        <div className="w-full overflow-hidden relative h-[600px] rounded-2xl p-10 text-white bg-neutral-800">
           {loadingCompleteJob ? (
   <div className="flex justify-center items-center h-[515px]">
   {/* <p className="text-neutral-600 dark:text-neutral-300">Loading...</p> */}
   <ReactLoading type="spin" color="#fff" height={67} width={67} />
    </div>
  ) : completeJobs1?.length > 0 ? (
    <ul className="space-y-4">
      <ExpandableCard jobs={ completeJobs1} getAns={getAnswers} loadingAns={loadingAns}/>
    </ul>
  ) : (
    <p className="text-neutral-600 dark:text-neutral-300">
      No pending jobs found.
    </p>
  )}
        </div>
      )}
    


       {view==="pending" && <>
         <div className="w-full flex">
         <button className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all" disabled={pendingIdxRef.current === 0} onClick={() => getPendingJobs('previous')}>previous</button>
         {pendingIdxRef.current+1}
         <button className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all" 
         // disabled={prevPending.length === 0} 
         onClick={() => getPendingJobs('next')}>next</button>
       </div></>}

       {view!=="pending" && <>
         <div className="w-full flex">
         <button className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all" disabled={pendingIdxRef.current === 0} onClick={() => getCompleteJobs('previous')}>previous</button>
         {completeIdxRef.current+1}
         <button className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all" 
         // disabled={prevPending.length === 0} 
         onClick={() => getCompleteJobs('next')}>next</button>
       </div></>}
      </div>
    </div>
  );
};

export default Dashboard;
