"use client";

import React, { useEffect, useState } from "react";

interface QuestionSet {
  question: { question: string; url?: string };
  options: Array<string>; // Options for the question
  answers?: string[]; // Optional field for user-selected answers
}

interface QuestionVerificationProps {
  questions: Array<QuestionSet>;
  onProceed: () => void;
  questionType: string;
  userAnswers: Array<QuestionSet>;
  setUserAnswers : (e:any)=>void;
}

const QuestionVerification = ({ questions, onProceed, questionType,userAnswers,setUserAnswers }: QuestionVerificationProps) => {
  // State to hold user answers in the desired structure
  // const [userAnswers, setUserAnswers] = useState<QuestionSet[]>( 
  //   questions.map(q => ({
  //     ...q,
  //     answers: [] 
  //   }))
  // );

  // setUserAnswers(questions.map(q => ({
  //       ...q,
  //       answers: [] 
  //     })))
  // console.log("userAnswers",questions.map(q => ({
  //   ...q,
  //   answers: [] 
  // })))  

  const handleAnswerChange = (questionIndex: number, option: string) => {
    const updatedAnswers = [...userAnswers];
    const selectedAnswers = updatedAnswers[questionIndex].answers || [];

    if (selectedAnswers.includes(option)) {
      // Unselect if already selected
      updatedAnswers[questionIndex].answers = selectedAnswers.filter(ans => ans !== option);
    } else {
      // Select answer
      updatedAnswers[questionIndex].answers = [...selectedAnswers, option];
    }

    setUserAnswers(updatedAnswers);
  };

  return (
    <div className="bg-neutral-800 h-[350px] w-full p-4 rounded-lg overflow-auto">
      {questions.map((questionObj, questionIndex) => (
        <div key={questionIndex} className="my-6">
          {/* Display question text */}
          <label className="text-white mb-4 block text-lg font-semibold">
            Q{questionIndex + 1}: {questionObj.question.question}
          </label>

          {/* Display question image if it exists (for image-text and image-image types) */}
          {questionType !== "text-text" && questionObj.question.url && (
            <img
              src={questionObj.question.url}
              alt={`Question ${questionIndex + 1}`}
              className="w-[200px] h-[auto] object-cover mb-4 rounded-lg"
            />
          )}

          {/* Answer Options (image or text based on questionType) */}
          <div className="grid grid-cols-2 gap-4">
            {questionObj.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className={`border-2 rounded-lg flex items-center justify-between p-4 cursor-pointer overflow-x-auto ${
                  userAnswers[questionIndex]?.answers?.includes(option)
                    ? "border-green-500 bg-green-600"
                    : "border-gray-600 bg-neutral-900"
                }`}
                onClick={() => handleAnswerChange(questionIndex, option)}
              >
                <label className="text-white flex items-center cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={userAnswers[questionIndex]?.answers?.includes(option)}
                    onChange={() => handleAnswerChange(questionIndex, option)}
                    className="mr-4 hidden"
                  />
                  {/* Render image for image options or text based on type */}
                  {questionType === "image-text" || questionType === "text-text" ? (
                    <span className="">{option}</span>
                  ) : (
                    <img src={option} alt={`Option ${optionIndex + 1}`} className="w-[auto] h-[250px] object-cover" />
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* <button
        onClick={() => {
          console.log(userAnswers);
          onProceed(); // Call onProceed function
        }}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Proceed
      </button> */}
    </div>
  );
};

export default QuestionVerification;
