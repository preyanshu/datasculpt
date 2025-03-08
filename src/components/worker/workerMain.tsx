"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCreatorData } from "@/context/context";
import { AptosClient, HexString } from "aptos";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import Register from "../register";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import ReactLoading from 'react-loading';
import { color } from "framer-motion";
import { type } from "os";
import RoleSwitcher from "../roleSwitcher";
import config from "@/context/config"

const NODE_URL = config.NODE_URL;
const client = new AptosClient(NODE_URL);

const moduleAddress = config.MODULE_ADDRESS;

const convertStructure = (oldData, account) => {
  console.log("Old Data:", oldData); // Log the old data for debugging

  const newData = oldData.flatMap((job) =>
    job.tasks
      .filter((task) => !task?.picked_by?.includes(HexString.ensure(account?.address).toShortString()) && !task.completed)
      .map((task) => {
        const { question, options, task_id, url, picked_by } = task;
        const isImageType =
          job.job_type === "image-text" || job.job_type === "image-image";
        const firstOption = options[0];
        const remainingOptions = options.slice(1);

        return {
          jobid: parseInt(job.jobId, 10),
          taskid: parseInt(task_id, 10),
          question: {
            question: isImageType ? question : question, // Redundant condition, but keeping it for clarity
            ...(isImageType && { url: url || firstOption }), // Add URL only for image-type jobs
          },
          options: isImageType ? remainingOptions : options, // For image jobs, exclude the first option
          type: job.job_type,
          isCompleted: task.completed,
          pickedBy: picked_by, // Include picked_by array in the result
        };
      })
  );

  console.log("New Data:", newData); // Log the new converted data for debugging

  return newData;
};


const saveJobTaskIndex = (
  walletAddress: string,
  job_start: number,
  task_start: number
) => {
  const data = {
    job_start,
    task_start,
  };

  localStorage.setItem(walletAddress, JSON.stringify(data));
};

const getJobTaskIndex = (walletAddress: string) => {
  const data = localStorage.getItem(walletAddress);
  return data ? JSON.parse(data) : { job_start: 0, task_start: 0 };
};

const Dashboard = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const { jobs, setJobs, creatorData, setCreatorData } = useCreatorData();
  const router = useRouter();

  React.useEffect(() => {
    if (!api) {
      console.log("API is not ready yet.");
      return;
    }

    console.log("API is ready, attaching event listener...");

    // Track slide changes
    api.on("select", () => {
      const currentSlide = api.selectedScrollSnap() + 1;
      console.log("Current slide:", currentSlide);
      console.log("Total count of slides (before fetch):", count);

      // If on the last slide, fetch the next batch of tasks
      if (!api.canScrollNext()) {
        // setCurrent(api.scrollSnapList().length);
        fetchNextBatch(10);
        api.scrollTo(1, false);
      }
    });
  }, [api, count]);

  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const handleOpen = () => setOpen(true);
  const { toast } = useToast();

  const currentJobIndexRef = useRef(0);
  const currentTaskIndexRef = useRef(0);
  let allBatchesEmpty = true;

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Main function to fetch jobs and tasks
  const getJobs = async (taskBatchSize = 10) => {
    if (!account) return [];
    setLoading1(true);

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

      let totalFetchedTasks = 0;
      let allJobs = [];

      // Get saved job/task index from localStorage
      const { job_start, task_start } = getJobTaskIndex(account?.address);

      let jobIndex =
        job_start > currentJobIndexRef.current
          ? job_start
          : currentJobIndexRef.current; // Get current job index from ref
      let taskIndex =
        task_start > currentTaskIndexRef.current
          ? task_start
          : currentTaskIndexRef.current; // Get current task index from ref

      let ans = [];
      // Continue fetching tasks until we meet the batch size and filter tasks
      while (
        jobIndex < jobCounter &&
        totalFetchedTasks < taskBatchSize &&
        ans.length === 0
      ) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::job_management::Job`,
          key: `${jobIndex + 1}`,
        };
        const job = await client.getTableItem(jobHandle, tableItem);

        const taskHandle = job.tasks.handle;
        const taskCounter = job.task_counter;

        console.log("JOb", job);

        // Calculate the number of tasks to fetch from this job
        const remainingTasksInJob = taskCounter - taskIndex;
        const tasksToFetch = Math.min(
          remainingTasksInJob,
          taskBatchSize - totalFetchedTasks
        );

        // Fetch tasks starting from the last fetched task index

        console.log("fetch", jobIndex, " ", taskIndex)
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
          job_type: job.job_type,
        });

        // Filter tasks based on the condition

        ans = convertStructure(allJobs, account);
        console.log(ans.length)
        if (ans.length > 0) {
          allBatchesEmpty = false;
        }

        // If no valid tasks found, fetch from the next job
        taskIndex += tasksToFetch;
        if (taskIndex >= taskCounter) {
          jobIndex++; // Move to the next job
          taskIndex = 0; // Reset task index for the new job
        }

        currentJobIndexRef.current = jobIndex; // Update the current job index in the ref
        currentTaskIndexRef.current = taskIndex; // Update the current task index in the ref
        // Save the job and task index in local storage if there are no tasks to process
        if (allBatchesEmpty && ans.length === 0) {
          console.log(allBatchesEmpty, "allBatchesEmpty in side");
          saveJobTaskIndex(account?.address, jobIndex, taskIndex);
        }
      }

      if (ans.length > 0) {
        // **Split jobs into two halves**
        const mid = Math.floor(ans.length / 2);
        let firstHalf = ans.slice(0, mid);
        let secondHalf = ans.slice(mid);

        // **Shuffle each half**
        shuffleArray(firstHalf);
        shuffleArray(secondHalf);

        // **Alternate Between First and Second Half**
        const shouldServeFirstHalf = Math.random() > 0.5; // Randomly decide which half to serve
        const finalJobs = shouldServeFirstHalf ? firstHalf : secondHalf;

        console.log(finalJobs, "finaljobs");
        setQuestions((prev) => [...finalJobs]);
        setJobs((prevJobs: Array<any>) => allJobs);
      }
      else {
        setQuestions([]);
      }
      console.log(ans, allBatchesEmpty, "ans");
      console.log("Fetched jobs and tasks:", allJobs);
      console.log(
        jobIndex,
        taskIndex,
        job_start,
        task_start,
        "jobIndex, taskIndex"
      );
      setLoading1(false);
    } catch (error) {
      console.error(error);
      setLoading1(false);
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
      // console.log(userData);
      return userData;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const fetchNextBatch = (numberOfTasks: number) => {
    setSelectedAnswers({}); // Reset selected answers
    setSubmittedQuestions({}); // Reset submitted questions
    console.log("fetching.....");
    getJobs(numberOfTasks); // Fetch the next batch of tasks
  };

  useEffect(() => {
    if (connected) {
      setLoading(true);
      getUserProfile(account?.address).then((res) => {
        console.log(res);
        setCreatorData(res ? res[0] : null);
        if (res === null) handleOpen();
        setLoading(false);
      });
      if (jobs.length === 0) {
        getJobs();
      }
    }
  }, [account, open, connected]);

  useEffect(() => {
    // if(creatorData?.role=="1"){
    //   router.push("/creators/tasks")
    // }
  }, [creatorData]);

  // const questions = convertStructure(jobs);

  const [questions, setQuestions] = useState([]);

  // useEffect(() => {
  //   console.log(jobs, "ejobs");
  //   const converted = convertStructure(jobs);
  //   setQuestions(converted);
  // }, [jobs]);

  // Store selected answers for each question as an array (to support multiple answers)
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string[];
  }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<{
    [key: number]: boolean;
  }>({});

  // Function to toggle the selected answer in a multiple-choice setting
  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => {
      const prevAnswers = prev[questionIndex] || [];
      if (prevAnswers.includes(answer)) {
        // If the option is already selected, remove it (deselect)
        return {
          ...prev,
          [questionIndex]: prevAnswers.filter((ans) => ans !== answer),
        };
      } else {
        // Otherwise, add the option to the selected answers
        return {
          ...prev,
          [questionIndex]: [...prevAnswers, answer],
        };
      }
    });
  };

  const pickJob = async (
    options: Array<string>,
    jobId: number,
    taskId: number,
    questionIndex: number
  ) => {
    if (!account) {
      console.log("connect your wallet");
      return [];
    }
    // if(options?.length === 0){
    //   alert("Please select an answer to proceed");
    //   return [];
    // }

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::job_management::pick_and_complete_task`,
        functionArguments: [jobId, taskId, options],
      },
    };
    console.log(transaction.data);
    try {
      const response = await signAndSubmitTransaction(transaction);
      console.log("Created.", response);
      await client.waitForTransaction(response.hash);

      setSubmittedQuestions((prev) => ({
        ...prev,
        [questionIndex]: true,
      }));

      toast({ title: "Success", description: "Task completed successfully" });
      getUserProfile(account?.address).then((res) => {
        console.log(res);
        setCreatorData(res ? res[0] : null);
        // if (res === null) handleOpen();
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error ? "" +error :  "There may be some issues with wallet connection, please reload/reconnect your wallet properly the page and try again",
      });
      console.log(error);
    }
  };

  const handleSubmit = (
    questionIndex: number,
    jobId: number,
    taskId: number
  ) => {
    // Log the selected answers for the current question
    const selectedOptions = selectedAnswers[questionIndex];
    console.log(selectedOptions, "selectedOptions", jobId, taskId);
    if (selectedOptions?.length === 0 || !selectedOptions) {
      // alert("Please select an answer to proceed");
      toast({ variant: "destructive", title: "Error", description: "Please select an answer to proceed" });
      return;
    }

    const res = pickJob(selectedOptions, jobId, taskId, questionIndex);
    console.log("picked job response", res);



    //todo confirm the trancsaction executed
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-semibold text-center">
          Connect your wallet to proceed
        </h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ReactLoading type={"spin"} height={67} width={67} />
      </div>
    );
  }

  return creatorData === null ? (
    <div className="h-full flex flex-col gap-4 justify-center items-center">
      {/* <h1 className="text-3xl font-semibold text-center">Please register to continue....</h1> */}
      {/* <Button color="primary" className="hover:pointer" onClick={handleOpen}>
        Register
    </Button> */}
      {/* <div className="w-[100px] h-[100px] " data-aos="zoom-in"></div> */}

      <div data-aos="zoom-down" className=" w-full">
        <Register open={open} setOpen={setOpen} user={"worker"} />
      </div>
    </div>
  ) :
    creatorData?.role === "1" ?
      (
        <RoleSwitcher role="creator" />
      )
      : (
        <div className="flex flex-col items-center w-full h-full">
          <div className="absolute top-5 right-[250px] flex justify-end w-[60%] items-center">
            <h1 className=" text-xl flex items-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 shadow-md mr-[30px]">
              <span className="text-white">Reputation: </span>

              <span className="ml-2 text-2xl">
                {
                  creatorData.reputation_points > 0 ? (
                    "⭐".repeat(creatorData.reputation_points) // Render stars based on reputation score
                  ) : (
                    <span className="text-red-500 text-xl ">User Banned</span>
                  ) // Show 'User Banned' if score is 0
                }
              </span>
            </h1>

            <h1 className="text-xl font-bold shadow-md">
              <span className="text-white">Balance:</span>{" "}
              <span className="ml-2 text-green-500">
                {creatorData.balance / 1e8} APT
              </span>
            </h1>
          </div>

          <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-900 flex justify-center items-center flex-col gap-2 flex-1 w-full h-full">
            <div className="flex gap-2 flex-1 justify-center min-h-[500px] w-full max-w-[76%]">
              <div className="h-full w-3/4 rounded-lg p-4 flex justify-center items-center mt-10 flex-col">
                <div className="w-full ml-8 -mt-15 mb-5 text-4xl">
                  <h1>Tasks</h1>
                </div>

                <Carousel
                  className="w-full max-w-[800px] relative"
                  //  onSlideChange={handleSlideChange}
                  setApi={setApi}
                >
                  {loading1 && <div className="absolute top-0 left-0 h-full w-full border-neutral-700 bg-neutral-800 rounded-2xl flex items-center justify-center" style={{ zIndex: 100 }}>
                    <ReactLoading type={"spin"} height={67} width={67} />

                  </div>}
                  <CarouselContent>
                    {/* Disclaimer Carousel Item */}

                    <CarouselItem>
                      <div className="p-1">
                        <Card className="border-none rounded-lg">
                          <CardContent className="flex h-[400px] items-center justify-center p-6 dark:bg-neutral-800 border-neutral-800 rounded-lg">
                            <div className="bg-neutral-800 h-[350px] w-full p-4 rounded-lg overflow-auto flex flex-col items-center justify-center">
                              <h2 className="text-white text-2xl mb-4">
                                Important Notice
                              </h2>
                              <p className="text-gray-400 mb-4 text-center">
                                Please answer the questions with utmost honesty.
                                Some questions have predetermined answers, and
                                failing to answer them correctly will affect your
                                reputation points. If you provide three incorrect
                                answers, your account may be banned. If you have any
                                balance in your account, you might lose that money.
                                Take your time and answer carefully.
                              </p>
                              <p className="text-yellow-500 font-semibold">
                                Thank you for your understanding!
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>

                    {/* {console.log(questions
                  .filter(
                    (e) =>
                      !e?.pickedBy?.includes(account?.address) &&
                      !e?.isCompleted
                  ), "questions")} */}
                    {/* {console.log(currentAddress, "currentAddress")} */}

                    {/* Questions Carousel Items */}
                    {questions
                      .filter(
                        (e) =>
                          !e?.pickedBy?.includes(account?.address) &&
                          !e?.isCompleted
                      )
                      .map((questionObj, questionIndex: number) => (
                        <CarouselItem key={questionIndex}>
                          <div className="p-1">
                            <Card className="border-none rounded-lg">
                              <CardContent className="flex h-[400px] items-center justify-center p-6 dark:bg-neutral-800 border-neutral-800 rounded-lg">
                                <div className="bg-neutral-800 h-[350px] w-full p-4 rounded-lg overflow-auto relative">
                                  {/* Question Display */}
                                  <div className="my-6 select-none">
                                    <label className="text-white mb-4 block text-lg font-semibold">
                                      {/* {JSON.stringify(questionObj.isCompleted)} */}
                                      {/* {String(questionObj?.isCompleted)}
                                      {String(
                                        questionObj?.pickedBy?.includes(
                                          account?.address
                                        )
                                      )} */}
                                      Q{questionIndex + 1}:{" "}
                                      {questionObj.question.question}
                                    </label>

                                    {/* If there is an image URL, display it */}
                                    {questionObj.question.url &&
                                      (questionObj.type === "image-text" ||
                                        questionObj.type === "image-image") && (
                                        <img
                                          src={questionObj.question.url}
                                          alt={`Question ${questionIndex + 1}`}
                                          className="w-[120px] h-[120px] object-cover mb-4 rounded-lg"
                                        />
                                      )}

                                    {/* Answer Options (text or image) */}
                                    <div className="grid grid-cols-2 gap-4">
                                      {questionObj.options.map(
                                        (option, optionIndex: number) => (
                                          <div
                                            key={optionIndex}
                                            className={`border-2 rounded-lg flex items-center justify-between p-4 cursor-pointer overflow-auto ${selectedAnswers[
                                                questionIndex
                                              ]?.includes(option)
                                                ? "border-green-700 bg-green-600"
                                                : "border-gray-600 bg-neutral-900"
                                              }`}
                                            onClick={() =>
                                              handleAnswerChange(
                                                questionIndex,
                                                option
                                              )
                                            }
                                          >
                                            <label className="text-white flex items-center cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={selectedAnswers[
                                                  questionIndex
                                                ]?.includes(option)}
                                                onChange={() =>
                                                  handleAnswerChange(
                                                    questionIndex,
                                                    option
                                                  )
                                                }
                                                className="mr-4 hidden"
                                              />
                                              {questionObj?.type === "image-image" ||
                                                questionObj?.type === "text-image" ? (
                                                <img
                                                  src={option}
                                                  alt={`Option ${optionIndex + 1}`}
                                                  className="w-[150px] h-[150px] object-cover"
                                                />
                                              ) : (
                                                <span>{option}</span>
                                              )}
                                            </label>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Submit Task Button on bottom-right */}
                                  <div className="flex justify-end">
                                    {!submittedQuestions[questionIndex] && (
                                      <button
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                        onClick={() =>
                                          handleSubmit(
                                            questionIndex,
                                            questionObj.jobid,
                                            questionObj.taskid
                                          )
                                        }
                                      >
                                        Submit Task
                                      </button>
                                    )}

                                    {submittedQuestions[questionIndex] && (
                                      <div className="text-green-500 font-semibold">
                                        Task Submitted
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}

                    {/* Extra CarouselItem for Task End Message */}
                    <CarouselItem>
                      <div className="p-1">
                        <Card className="border-none">
                          <CardContent className="flex h-[400px] items-center justify-center p-6 dark:bg-neutral-800 border-none rounded-lg">
                            {!loading1 ? (
                              <div className="bg-neutral-800 h-[350px] w-full p-4 rounded-lg overflow-auto flex flex-col items-center justify-center">
                                <h2 className="text-white text-2xl mb-4">
                                  Task Ended
                                </h2>
                                <p className="text-gray-400 mb-6 text-center">
                                  You have completed all tasks. Please refresh the
                                  page to check for new tasks or updates.
                                </p>
                                <button
                                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                  onClick={() => {
                                    handleRefresh()
                                  }}
                                >
                                  Refresh
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full">
                                <ReactLoading type={"spin"} height={67} width={67} />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  {!loading1 && <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>}
                </Carousel>


              </div>
            </div>
          </div>
        </div>
      );
};

export default Dashboard;
