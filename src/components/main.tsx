'use client'
import React, { useState, useEffect } from "react";
import { FloatingDockDemo } from "./floating-dock";
import { FileUploadDemo } from "./file-upload";
import { AnimatedModalDemo } from "./modal";
import { TaskExtracted } from "./taskExtracted";
import QuestionVerification from "./QuestionVerification";
import Papa from "papaparse";
import { useCreatorData } from "@/context/creatorContext";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import Register from "./Register";
import { AptosClient } from "aptos";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";

const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

const moduleAddress =
  "0x3345aa79df67a6e958da1693380a2bbef9882fc309da10564bcbe6dcdcf0d801";

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
  
  console.log(creatorData);

  const getUserProfile = async (address: string | undefined) => {
    if (!address) {
      console.log("Address is not valid");
      return null;
    }
    const payload = {
      function: `${moduleAddress}::user_registry::get_user_profile`,
      type_arguments: [],
      arguments: [address]
    }
    try {
      const userData = await client.view(payload);
      // console.log(userData);
      return userData;
    } catch (error) {
      console.log(error);
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
      // getJobs();
    }
  }, [account, open]);

  useEffect(() => {
    // Whenever questions change, filter a random set of them for verification
    if (questions.length > 0) {
      const randomQuestions = getRandomQuestionsForVerification(questions);
      setFilteredQuestions(randomQuestions);

      // Initialize predefined answers for user input
      setPredefinedQuestions(randomQuestions.map(q => ({ ...q, answers: [] })));
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
    const basePrice = 0.025 * numberOfTasks * peoplePerTask;
    const fee = basePrice * 0.2;
    return basePrice + fee;
  };

  const handleQuestionTypeChange = (type: string) => {
    setFiles([]); 
    setStep(1); // Reset to step 1
    setSelectedQuestionType(type);
  };

  const parseCSVToQuestions = (file: File): Promise<QuestionSet[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results: any) => {
          const questions: QuestionSet[] = results.data.map((row: any) => {
            const [question, ...options] = row as string[];

            if (selectedQuestionType === "image-text" || selectedQuestionType === "image-image") {
              const imageUrl = options.shift(); // Extract the image URL if applicable
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

          // Filter out any entries that do not have a question
          const filteredQuestions = questions.filter((q) => q.question.question);
          resolve(filteredQuestions);
        },
        header: false, // Set to true if your CSV has headers
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
              <TaskExtracted taskExtracted={numberOfTasks} failed={0} title={"Total Data (Extracted and Failed)"} />
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
                  <span>{peoplePerTask}</span>
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
            console.log("userAnswers",predefinedQuestions)
            console.log("questions",questions)
          }}>
          </button>
          <QuestionVerification
            questions={filteredQuestions} // Send only filtered random questions
            onProceed={() => console.log("Proceed")}
            questionType={selectedQuestionType}
            userAnswers={predefinedQuestions}
            setUserAnswers={(updatedAnswers) => setPredefinedQuestions(updatedAnswers)}
          />
        </div>
      );
    }
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
  return creatorData === null ? 
  <div className="h-full flex flex-col gap-4 justify-center items-center">
    {/* <h1>Please register to continue....</h1>
    <Button color="primary" className="hover:pointer" onClick={handleOpen}>
        Register
    </Button> */}
    <Register open={open} setOpen={setOpen} user={"creator"}/>
  </div> 
  : 
  (creatorData?.role === "2") ?
     (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-semibold text-center">
          You are a Worker. Please switch to Creator to proceed
        </h1>
      </div>
    )
  : (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-900 flex justify-center items-center flex-col gap-2 flex-1 w-full h-full">
        <FloatingDockDemo setSelectedQuestionType={handleQuestionTypeChange} />

        <div className="flex gap-2 flex-1 justify-center min-h-[500px] w-[80%]">
          <div className="h-full w-3/4 rounded-lg bg-gray-100 dark:bg-neutral-800 p-4">
            <div className="text-center text-3xl font-semibold mt-5 text-white">
              Step {step} of 3: {step === 2 ? "Analytics Overview" : step === 1 ? "Upload CSV File" : "Verify Questions"}
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
                  disabled={step === 3 || (step === 1 && files.length === 0)}
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
