
import { createContext, useContext, useState, ReactNode } from "react";

interface CreatorContextType {
  creatorData: any;
  setCreatorData: React.Dispatch<React.SetStateAction<any>>;
  jobs: any;
  setJobs: React.Dispatch<React.SetStateAction<any>>;
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

export const CreatorProvider = ({ children }: { children: ReactNode }) => {
  
  const [creatorData, setCreatorData] = useState( null
  //   {
  //   "balance": "0",
  //   "isBanned": false,
  //   "name": "test creator2",
  //   "reputation_points": "3",
  //   "role": "1",
  //   "wallet_address": "0xda49d81fc1ddff59976795b41897a6a999302b5ed75a903184e87fe1f9a5fbab"
  // }
);
  const [jobs, setJobs] = useState([
    // {
    //   creator: "0xda49d81fc1ddff59976795b41897a6a999302b5ed75a903184e87fe1f9a5fbab",
    //   jobId: "1",
    //   taskCounter: "1",
    //   type :"text-image",
    //   tasks: [
    //     {
    //       completed: false,
    //       max_workers: "1",
    //       options: ["Mumbai", "Kolkata", "New Delhi", "Madras"],
    //       picked_by: [],
    //       question: "What is the capital of India?",
    //       task_answers: [],
    //       task_id: "1",
    //     },
    //   ],
    // },
    // {
    //   creator: "0xda49d81fc1ddff59976795b41897a6a999302b5ed75a903184e87fe1f9a5fbab",
    //   jobId: "2",
    //   taskCounter: "4",
    //   type : "image-text",
    //   tasks: [
    //     {
    //       completed: false,
    //       max_workers: "1",
    //       options: ["Tokyo", "Berlin", "London", "Paris"],
    //       picked_by: [],
    //       question: "What is the capital of Japan?",
    //       task_answers: [],
    //       task_id: "1",
    //     },
    //     {
    //       completed: false,
    //       max_workers: "1",
    //       options: ["Tokyo", "Berlin", "London", "Paris"],
    //       picked_by: [],
    //       question: "What is the capital of Russia?",
    //       task_answers: [],
    //       task_id: "2",
    //     },
    //     {
    //       completed: false,
    //       max_workers: "1",
    //       options: ["Tokyo", "Berlin", "London", "Paris"],
    //       picked_by: [],
    //       question: "What is the capital of France?",
    //       task_answers: [],
    //       task_id: "3",
    //     },
    //     {
    //       completed: false,
    //       max_workers: "1",
    //       options: ["Tokyo", "Berlin", "London", "Paris"],
    //       picked_by: [],
    //       question: "What is the capital of England?",
    //       task_answers: [],
    //       task_id: "4",
    //     },
    //   ],
    // },
  ]);

  return (
    <CreatorContext.Provider value={{ creatorData, setCreatorData,jobs,setJobs }}>
      {children}
    </CreatorContext.Provider>
  );
};

export const useCreatorData = () => {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error("useCreatorData must be used within a CreatorProvider");
  }
  return context;
};
