'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from Next.js
import { FloatingDockDemo } from "../floating-dock";
import { FileUploadDemo } from "../fileUpload";
import { AnimatedModalDemo } from "../orderModal";
import { TaskExtracted } from "../taskExtracted";
import QuestionVerification from "../questionVerification";
import Papa from "papaparse";
import { useCreatorData } from "@/context/context";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import Register from "../register";
import { AptosClient } from "aptos";
import { Button } from "../ui/button";
import { useToast } from "@/components/ui/use-toast";
import ReactLoading from "react-loading";
import { error } from "console";
import { data, map, filter, header } from "framer-motion/client";
import { url } from "inspector";
import { parse } from "path";
import RoleSwitcher from "../roleSwitcher";
import config from "@/context/config"

const NODE_URL = config.NODE_URL;
const client = new AptosClient(NODE_URL);

const moduleAddress = config.MODULE_ADDRESS;

interface QuestionSet {
  question: { question: string; url?: string };
  options: string[];
  answers?: string[];
}

// Randomly shuffle and return a selected number of questions
const getRandomQuestionsForVerification = (questions: QuestionSet[]) => {
  const maxQuestions = Math.min(5, Math.max(1, Math.floor(questions.length / 2))); // Min 1, max 5 or half
  const shuffled = questions.sort(() => 0.5 - Math.random()); // Shuffle questions
  return shuffled.slice(0, maxQuestions); // Select first `maxQuestions`
};

const Dashboard = () => {
  const router = useRouter(); // Initialize useRouter for navigation
  const [step, setStep] = useState(1);
  const [numberOfTasks, setNumberOfTasks] = useState(0); // Number of extracted data
  const [peoplePerTask, setPeoplePerTask] = useState(1); // Slider value
  const [selectedQuestionType, setSelectedQuestionType] = useState("text-text");
  const [questions, setQuestions] = useState<QuestionSet[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionSet[]>([]);
  const [predefinedQuestions, setPredefinedQuestions] = useState<QuestionSet[]>([]);
  const { jobs, setJobs, creatorData, setCreatorData } = useCreatorData();
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const { toast } = useToast();
  const [loading , setLoading] = useState(false);
  
  console.log(creatorData);

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
      return userData;
    } catch (error) {
      console.log(error);
      setLoading(false);
      return null;
    }
  }

  useEffect(() => {
    if (connected) {
      getUserProfile(account?.address).then((res) =>{
        console.log(res);
        setCreatorData(res ? res[0] : null);
        if(res === null)handleOpen();
      })
    }
  }, [account, open, connected]);

  useEffect(() => {
    if (questions.length > 0) {
      const randomQuestions = getRandomQuestionsForVerification(questions);
      setFilteredQuestions(randomQuestions);
      setPredefinedQuestions(questions.map(q => ({ ...q, answers: [] })));
    }
  }, [questions]);

  const handleNext = async () => {
    if (step === 1) {
      const questions = await parseCSVToQuestions(files[0]);
      setQuestions(questions); // Set all parsed questions
      setNumberOfTasks(questions.length); // Set total number of tasks
    }

    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePeoplePerTaskChange = (event) => {
    setPeoplePerTask(event.target.value);
  };

  const calculatePrice = () => {
    const basePrice = 0.05 * numberOfTasks * peoplePerTask;
    const fee = basePrice * 0.02;
    console.log(basePrice, fee,"calculated price");
    return basePrice + fee;
  };

  const handleQuestionTypeChange = (type: string) => {
    setStep(1); 
    setSelectedQuestionType(type);
  };

const parseCSVToQuestions = (file: File): Promise<QuestionSet[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results: any) => {
        // Skip the first row and map the remaining rows
        const questions: QuestionSet[] = results.data.slice(1).map((row: any) => {
          const [question, ...options] = row as string[];

          if (selectedQuestionType === "image-text" || selectedQuestionType === "image-image") {
            const imageUrl = options.shift(); 
            return {
              question: { question, url: imageUrl || "" },
              options: options,
            };
          }

          return {
            question: { question },
            options: options,
          };
        });

        const filteredQuestions = questions.filter((q) => q.question.question);
        resolve(filteredQuestions);
      },
      header: false,
      skipEmptyLines: true,
      error: (error: any) => {
        reject(error);
      },
    });
  });
};


  const renderFileUploadContent = () => {
    if (step === 2) {
      return (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-neutral-800 p-4 rounded-lg">
              <TaskExtracted taskExtracted={numberOfTasks} failed={0} title={"Total Data"} />
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <div className="my-4">
                <label className="text-xl mb-2 block text-white">Number of People per Task</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={peoplePerTask}
                  onChange={handlePeoplePerTaskChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm mt-2 text-gray-400">
                  <span>1</span>
                  <span className="text-blue-500 " style={{fontWeight:"bold"}}>{peoplePerTask}</span>
                  <span>10</span>
                </div>
                <p className="my-5 bg-gray-800 text-orange-400 border text-sm border-gray-700 rounded-lg p-3">
                  Note: The number of people per task is directly proportional to the accuracy of the task.
                </p>
              </div>
              <div className="mt-4">
                <p className="text-xl font-medium text-white">Total Price: {calculatePrice().toFixed(2)} APT</p>
                <p className="text-gray-500">(Base Price + 2% fee included)</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (step === 1) {
      return <FileUploadDemo selectedQuestionType={selectedQuestionType} files={files} setFiles={setFiles} />;
    } else if (step === 3) {
      return (
        <div className="my-3">
          <button onClick={()=>{
            console.log("userAnswers",predefinedQuestions);
            console.log("questions",questions);
          }}>
          </button>
          <QuestionVerification
            questions={filteredQuestions} 
            onProceed={() => console.log("Proceed")}
            questionType={selectedQuestionType}
            userAnswers={predefinedQuestions}
            setUserAnswers={(updatedAnswers) => setPredefinedQuestions(updatedAnswers)}
          />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {/* <img src="/assets/loading.gif" alt="" className="h-[80px]" /> */}
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
  }

  if (creatorData === null) {
    return (
      <div className="h-full flex flex-col gap-4 justify-center items-center">
        <Register open={open} setOpen={setOpen} user={"creator"}/>
      </div>
    );
  } 

  // Redirect worker users to /worker/tasks
  if (creatorData?.role === "2") {
    return (
        <RoleSwitcher role="worker" />
    )
  }

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-900 flex justify-center items-center flex-col gap-2 flex-1 w-full h-full">
        <FloatingDockDemo setSelectedQuestionType={handleQuestionTypeChange} />

        <div className="flex gap-2 flex-1 justify-center min-h-[500px] w-[80%]">
          <div className="h-full w-3/4 rounded-lg bg-gray-100 dark:bg-neutral-800 p-4">
            <div className="text-center text-3xl font-semibold mt-5 text-white">
              Step {step} of 3: {step === 2 ? "Analytics Overview" : step === 1 ? "Upload CSV File" : "Verify Questions"}
              {step === 3 && (
                <div className="mt-8 border-2 border-gray-700 p-2 rounded-lg bg-slate-900">
                  <p className="text-sm text-orange-400 font-light font-mono">
                   <span className="text-yellow-500 font-semibold">(Optional)</span> Please provide some answers to your questions. This will help us verify workers answer
                  </p>
                </div>
              )}

              
            </div>

            {renderFileUploadContent()}

            <div className="flex justify-end mr-5">
              <button
                className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded disabled:opacity-50 mr-5"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </button>
              {step !== 3 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                  onClick={handleNext}
                  disabled={step === 3 || (step === 1 && files?.length === 0)}
                >
                  Next Step
                </button>
              )}
              {step === 3 && (
                <AnimatedModalDemo
                  totalTasks={numberOfTasks}
                  peoplePerTask={peoplePerTask}
                  totalPrice={calculatePrice()}
                  predefinedQuestions={predefinedQuestions}
                  questionType={selectedQuestionType}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
