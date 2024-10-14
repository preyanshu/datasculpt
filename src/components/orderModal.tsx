"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "./ui/animated-modal";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

import { AptosClient } from "aptos";
import { useToast } from "./ui/use-toast";
import { useModal } from "@/components/ui/animated-modal";
import { map } from "framer-motion/client";
import { url } from "inspector";
import config from "@/context/config"

const NODE_URL = config.NODE_URL;
const client = new AptosClient(NODE_URL);

const moduleAddress = config.MODULE_ADDRESS;

interface AnimatedModalDemoProps {
  totalTasks: number;
  peoplePerTask: number;
  totalPrice: number;
  predefinedQuestions: any[];
  questionType: string; // Assuming predefinedQuestions is an array of objects
}

export const AnimatedModalDemo: React.FC<AnimatedModalDemoProps> = ({
  totalTasks,
  peoplePerTask,
  totalPrice,
  predefinedQuestions,
  questionType,
}) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [name, setName] = useState("");
  const {toast} = useToast();
  const { setOpen } = useModal();

  console.log("predefined",predefinedQuestions);


  const pricePerPerson = 0.05;
  const platformFee = totalPrice * 0.02; 
  const totalWithFee = totalPrice ; 
  console.log(totalWithFee * 1e8);


  const isPredefined = predefinedQuestions.every(
    (question) => question.answers && question.answers.length >= 0
  );
  const isImageType = questionType === "image-image" || questionType === "image-text";

const questions = predefinedQuestions.map((question) => {
  return question.question.question;
});

const answers = predefinedQuestions.map((question) => {
  if (isImageType && question.question.url) {
    // Add the image URL as the first option if it's an image-based question
    return [question.question.url, ...question.options];
  }
  return question.options;
});

const preanswers = predefinedQuestions.map((question) => {
  return question.answers;
});

  // console.log(questions, answers, "p",preanswers);
  const createJob = async () => {
    if (!account) {
      console.log("connect your wallet");
      return [];
    }
    let fee: number = totalWithFee * 1e8;
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::job_management::create_job`,
        functionArguments: [
          questions,
          answers,
          preanswers, 
          peoplePerTask,
          fee.toFixed(0),
          name,
          questionType,
        ],
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      console.log("Created.", response);
      await client.waitForTransaction(response.hash);
      toast({
        title: "Success",
        description: "Job created successfully.",
      });
      setOpen(false);
    } catch (error) {
      console.log(error, "failed to job");
    
      toast({
        variant: "destructive",
        title: "Error",
        description: error ? "" + error :  "There may be some issues with wallet connection, please reload/reconnect your wallet properly the page and try again",
      });
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Modal>
        <ModalTrigger
          className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn relative"
          predefined={isPredefined}
        >
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Review Details
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
          📝
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent className="p-6">
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Order Summary for your{" "}
              <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                Job
              </span>
            </h4>

            <div className="mb-6">
              <label
                htmlFor="orderName"
                className="block text-[17px] font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1"
              >
                Name your order:
              </label>
              <input
                id="orderName"
                type="text"
                className="mt-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter a name for your order"
                name="jobName"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>

            {/* Price Details */}
            <div className="space-y-4 text-neutral-600 dark:text-neutral-200">
              <div className="flex justify-between">
                <span>Total Tasks:</span>
                <span>{totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span>People per Task:</span>
                <span>{peoplePerTask}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per Person:</span>
                <span>{pricePerPerson.toFixed(2)} APT</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (2%):</span>
                <span>{platformFee.toFixed(2)} APT</span>
              </div>
              <div className="border-t border-neutral-300 dark:border-neutral-700 my-4"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>{totalWithFee.toFixed(2)} APT</span>
              </div>
            </div>
          </ModalContent>

          {/* Footer with actions */}
          <ModalFooter className="gap-4" name={name}>
            <button
              className="bg-green-500 text-white dark:bg-green-700 dark:text-white text-sm px-4 py-2 rounded-md border border-black w-36"
              onClick={()=>{
                if(!name || name===""){
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please enter a name.",
                  });
                  return;
                }
                createJob();
              }}
            >
              Confirm and Pay
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
};
