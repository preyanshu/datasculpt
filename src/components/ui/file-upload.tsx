import { cn } from "@/lib/utils";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import {useRouter} from "next/navigation";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  files,
  selectedQuestionType,
}: {
  onChange?: (files: File[]) => void;
  files: File[];
  selectedQuestionType: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // This effect runs whenever selectedQuestionType changes and resets the files
  useEffect(() => {
    // Reset files to an empty array when the selected question type changes
    if (onChange) {
      onChange([]);
    }
  }, [selectedQuestionType]);

  const handleFileChange = (newFiles: File[]) => {
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };


  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: handleFileChange,
    accept: {
      "text/csv": [".csv"], // Only allow CSV files
    },
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  const router = useRouter()

  const handleCSVExample = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  
    let exampleUrl = "";
  
    switch (selectedQuestionType) {
      case "text-text":
        exampleUrl = "https://docs.google.com/spreadsheets/d/1yLmXifz1LhnaAyoao1iwm8gbSi--bMn1TlQL2bMgDDI/edit?usp=sharing"; // Replace with your actual path
        break;
      case "text-image":
        exampleUrl = "https://docs.google.com/spreadsheets/d/1DFB9JlvFyb4a1zSPIV-IWmCjR32PYonpo4GV1hY_0KU/edit?usp=sharing"; // Replace with your actual path
        break;
      case "image-text":
        exampleUrl = "https://docs.google.com/spreadsheets/d/1WQL1rwG6kME4rXKunc4RecOzt6ERMiF5Sbswf3PChS4/edit?usp=sharing"; // Replace with your actual path
        break;
      case "image-image":
        exampleUrl = "https://docs.google.com/spreadsheets/d/1pl06NZxWzskHa8Mg8vNPft4Hl2HPsKEwGUAtBFEADoo/edit?usp=sharing"; // Replace with your actual path
        break;
      default:
        exampleUrl = "https://docs.google.com/spreadsheets/d/1yLmXifz1LhnaAyoao1iwm8gbSi--bMn1TlQL2bMgDDI/edit?usp=sharing"; // Fallback or default case
    }
  
    window.open(exampleUrl, "_blank");
  };
  

  return (
    <div key={selectedQuestionType} className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept=".csv" // Only CSV files are allowed
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload CSV
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2 z-[1000] hover:scale-125 transition duration-200 ease-out">
      {1 && (
        <span
          className="text-sky-500 mt-2 mb-3 cursor-pointer"
          onClick={handleCSVExample}
        >
          View example CSV for {selectedQuestionType} Type
        </span>
      )}
    </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                    "shadow-sm"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                    >
                      {file.type}
                    </motion.p>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                      modified {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
