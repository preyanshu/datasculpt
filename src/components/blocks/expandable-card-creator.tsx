import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, color, motion } from "framer-motion";
import Chart from "react-apexcharts";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { button } from "framer-motion/client";
import { type } from "os";
import ReactLoading from "react-loading";
import { FaDownload } from 'react-icons/fa'

interface Job {
  creator: string;
  jobId: string;
  taskCounter: string;
  amount: string;
  isCompleted: boolean;
  tasksPicked: string[];
  maxworkers: string;
  name: string;
  type : string;
}

interface ExpandableCardProps {
  jobs: Job[];
  getAns : any;
  loadingAns : boolean;
}

export default function ExpandableCard({ jobs , getAns , loadingAns }: ExpandableCardProps) {
  const [active, setActive] = useState<Job | null>(null);
  const [localJobs, setLocalJobs] = useState<Job[]>(jobs); // New state for local jobs
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Update local state whenever the jobs prop changes
  useEffect(() => {
    setLocalJobs(jobs);
    console.log("Jobs updated",jobs);
  }, [jobs]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    document.body.style.overflow = active ? "hidden" : "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const completionData = active
    ? active.tasksPicked.reduce((acc, workersPicked, index) => {
        const maxWorkers = Number(active.maxworkers);
        const pickedWorkers = Number(workersPicked);
        const completionPercentage = (pickedWorkers / maxWorkers) * 100;
        console.log("Workers Picked",workersPicked);
        console.log("Max Workers",maxWorkers);
        console.log("Completion Percentage",completionPercentage);
        let range: string;
        if (completionPercentage < 30) range = "0-30%";
        else if (completionPercentage < 50) range = "30-50%";
        else if (completionPercentage < 70) range = "50-70%";
        else if (completionPercentage < 90) range = "70-90%";
        else range = "90+";

        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const series = Object.values(completionData);
  const categories = Object.keys(completionData);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.jobId}-${id}`}
              layout
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.jobId}-${id}`}
              ref={ref}
              className="w-full max-w-[600px] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-lg p-5 pt-6"
            >
              <div className="flex justify-between items-center mb-4 ">
                <motion.h3
                  layoutId={`title-${active.jobId}-${id}`}
                  className="font-bold text-neutral-700 dark:text-neutral-200 text-lg ml-3 mt-3"
                >
                  Job ID: <span className="text-blue-600">{active.jobId}</span>
                </motion.h3>
                <motion.p
                  className={`mr-3 ${
                    active.isCompleted ? "text-green-500" : "text-yellow-500"
                  }`}
                >
                  Status: {active.isCompleted ? "Completed" : "In Progress"}
                </motion.p>
              </div>

              <div className="px-4"> <hr /></div>
            
              <div className="p-4">
                <div className="flex justify-between">
                  <strong>Name:</strong>
                  <span className="text-purple-500">{active.name}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Payment:</strong>
                  <span className="text-orange-500">{Number(active.amount) / 1e8 + " "}APT</span>
                </div>
                <div className="flex justify-between">
                  <strong>Total Tasks:</strong>
                  <span>{active.tasksPicked.length}</span>
                </div>
              </div>
              <div className="px-4 py-2">
              <hr />
              <div className="w-full flex justify-between  items-center mt-5"> <h4 className="font-semibold text-neutral-700 dark:text-neutral-200 ">Task Completion Distribution:</h4>

                 <button
      className="btn flex items-center justify-center bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      onClick={() => getAns(Number(active.jobId),active.type)}
      disabled={loadingAns}
    >
      {loadingAns ? (
        <ReactLoading
          type="spin"
          color="#ffffff"
          height={24}
          width={24}
          className="mr-2"
        />
      ) : (
        <FaDownload className="mr-2" />
      )}
      {loadingAns ? 'Downloading...' : 'Sculpted Data'}
    </button>
              
              </div>
               
                <Chart
                  options={{
                    chart: {
                      type: "bar",
                      background: "transparent",
                      toolbar: { show: false },
                    },
                    xaxis: {
                      categories: categories,
                      title: {
                        text: 'Completion Percentage',
                        style: {
                          color: '#FFFFFF',
                        },
                      },
                    },
                    yaxis: {
                      title: {
                        text: 'Number of Tasks',
                        style: {
                          color: '#FFFFFF',
                        },
                      },
                      grid: {
                        show: false,
                      },
                    },
                    plotOptions: {
                      bar: {
                        horizontal: false,
                        endingShape: 'rounded',
                      },
                    },
                    fill: {
                      colors: ["#10AA77"],
                    },
                    dataLabels: {
                      enabled: true,
                      style: {
                        colors: ["#FFFFFF"],
                      },
                    },
                    theme: {
                      mode: 'dark',
                    },
                  }}
                  series={[{ name: 'Tasks', data: series }]}
                  type="bar"
                  height={250}
                />
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="mx-auto w-full gap-4">
        {localJobs.map((job) => (
          <motion.div
            layoutId={`card-${job.jobId}-${id}`}
            key={`card-${job.jobId}-${id}`}
            onClick={() => setActive(job)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl cursor-pointer shadow hover:shadow-md transition-shadow duration-200 mb-30"
          >
            <div className="flex gap-4 flex-col md:flex-row">
              <div>
                <motion.h3
                  layoutId={`title-${job.jobId}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                {job.name}
                </motion.h3>

                <p className={`text-neutral-600 dark:text-neutral-400 text-center md:text-left`}>
                Job ID: {job.jobId}
                </p>
                <p className={`text-neutral-600 dark:text-neutral-400 text-center md:text-left`}>
                  Status: <span className={job.isCompleted ? "text-green-500" : "text-yellow-500"}>{job.isCompleted ? "Completed" : "In Progress"}</span>
                </p>
                <p className={`text-neutral-600 dark:text-neutral-400 text-center md:text-left`}>
                  Payment: <span className="text-orange-500">{Number(job.amount) / 1e8 + "  "}</span>APT
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
