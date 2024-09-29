"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCreatorData } from "@/context/creatorContext";
import { AptosClient } from "aptos";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import Register from "./Register";
import { Button } from "./ui/button";
import { toast } from "react-toastify";

const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);


const moduleAddress =
  "0x3345aa79df67a6e958da1693380a2bbef9882fc309da10564bcbe6dcdcf0d801";

const currentAddress = "0xa0480d4fab208ce268cac8a154f997b6aaf2036a0d9426384072b6b90659341a"

const convertStructure = (oldData) => {
  return oldData.flatMap((job) =>
    job.tasks.map((task) => {
      const { question, options, task_id, url, picked_by } = task;
      const isImageType =
        job.type === "image-text" || job.type === "image-image";
      const firstOption = options[0];
      const remainingOptions = options.slice(1);

      return {
        jobid: parseInt(job.jobId, 10),
        taskid: parseInt(task_id, 10),
        question: {
          question: isImageType ? question : question,
          ...(isImageType && { url: url || firstOption }),
        },
        options: isImageType ? remainingOptions : options,
        type: job.type,
        isCompleted: task.completed,
        pickedBy: picked_by, // Include picked_by array in the result
      };
    })
  );
};


const Dashboard = () => {
  const { jobs, setJobs, creatorData, setCreatorData } = useCreatorData();
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpen = () => setOpen(true);


  const getJobs = async () => {
    if (!account) return [];
    setLoading(true);
    try {
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
      // console.log(newJobs);
      // Set the jobs in state
      setJobs(newJobs);
      setLoading(false);
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
    setLoading(true);
    const payload = {
      function: `${moduleAddress}::user_registry::get_user_profile`,
      type_arguments: [],
      arguments: [address]
    }
    try {
      const userData = await client.view(payload);
      setLoading(false);
      // console.log(userData);
      return userData;
    } catch (error) {
      console.log(error);
      setLoading(false);
      return null;
    }
  }

  useEffect(() => {
    if (connected && creatorData === null) {
      getUserProfile(account?.address).then((res) =>{
        console.log(res);
        setCreatorData(res ? res[0] : null);
        if(res === null)handleOpen();
      })
      getJobs();
    }
  }, [account, open]);

  const questions = convertStructure(jobs);
  console.log(questions);

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

  const pickJob = async (options:Array<string>, jobId:number, taskId:number,questionIndex:number) => {
    if (!account) {
      console.log("connect your wallet");
      return [];
    }
    setLoading(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::job_management::pick_and_complete_task`,
        functionArguments: [jobId, taskId, options]
      }
    }
    try {
      const response = await signAndSubmitTransaction(transaction);
      console.log("Created.", response)
      await client.waitForTransaction(response.hash);
      setLoading(false);

      setSubmittedQuestions((prev) => ({
        ...prev,
        [questionIndex]: true,
      }));

      toast.success("Task completed successfully");
    } catch (error) {
      toast.error("Failed to complete the task" + error);
      console.log(error)
      setLoading(false);
    }
  }

  const handleSubmit = (questionIndex: number, jobId: number, taskId: number) => {
   

    // Log the selected answers for the current question
    const selectedOptions = selectedAnswers[questionIndex];
    console.log(
      `Selected options for question ${questionIndex + 1}:`,
      selectedOptions
    );
    
    const res = pickJob(selectedOptions, jobId, taskId , questionIndex);
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

  if(loading){
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <img src="/assets/loading.gif" alt="" className="h-[80px]" />
      </div>
    );
  }

  return creatorData === null ? 
  <div className="h-full flex flex-col gap-4 justify-center items-center">
    {/* <h1 className="text-3xl font-semibold text-center">Please register to continue....</h1> */}
    {/* <Button color="primary" className="hover:pointer" onClick={handleOpen}>
        Register
    </Button> */}
    <Register open={open} setOpen={setOpen} user={"worker"}/>
  </div> 
  : 
  (creatorData?.role === "1") ?
     (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-semibold text-center">
          You are a Creator. Please switch to Worker to proceed
        </h1>
      </div>
    )
  :
   (
    <div className="flex flex-col items-center w-full h-full">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-900 flex justify-center items-center flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2 flex-1 justify-center min-h-[500px] w-full max-w-[76%]">
          <div className="h-full w-3/4 rounded-lg p-4 flex justify-center items-center mt-10 flex-col">
            <div className="w-full ml-8 -mt-15 mb-5 text-4xl">
              <h1>Tasks</h1>
            </div>

            <Carousel className="w-full max-w-[800px]">
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

                {console.log(questions,"questions")}

                {/* Questions Carousel Items */}
                {questions.filter(e=>e?.picked_by?.includes(currentAddress)).map((questionObj, questionIndex: number) => (
                  <CarouselItem key={questionIndex}>
                    <div className="p-1">
                      <Card className="border-none rounded-lg">
                        <CardContent className="flex h-[400px] items-center justify-center p-6 dark:bg-neutral-800 border-neutral-800 rounded-lg">
                          <div className="bg-neutral-800 h-[350px] w-full p-4 rounded-lg overflow-auto relative">
                            {/* Question Display */}
                            <div className="my-6">
                              <label className="text-white mb-4 block text-lg font-semibold">
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
                                      className={`border-2 rounded-lg flex items-center justify-between p-4 cursor-pointer overflow-auto ${
                                        selectedAnswers[
                                          questionIndex
                                        ]?.includes(option)
                                          ? "border-green-500 bg-green-100"
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
                                        {questionObj.type === "text-text" ||
                                        questionObj.type === "text-image" ? (
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
                                  onClick={() => handleSubmit(questionIndex, questionObj.jobid, questionObj.taskid)}
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
                            onClick={handleRefresh}
                          >
                            Refresh
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
