"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

export function FileUploadDemo({ selectedQuestionType , setFiles , files}: any) {
  

  // Function to handle file upload and validate CSV
  const handleFileUpload = (uploadedFiles: File[]) => {
    

     console.log("uploadedFiles",uploadedFiles);
      setFiles(uploadedFiles); // Set the state with the valid CSV file
   
  
  };

  return (
    <div className="w-full max-w-4xl mx-auto border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg mt-8">
      <FileUpload onChange={handleFileUpload} selectedQuestionType={selectedQuestionType}  files={files}/>
    </div>
  );
}
