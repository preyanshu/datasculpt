import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Chart from "react-apexcharts";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface Task {
  taskId: number;
  title: string;
  maxWorkers: number;
  completedWorkers: number;
}

interface Job {
  id: number;
  title: string;
  status: string;
  description: string;
  payment: number;
  tasks: Task[];
}

interface ExpandableCardProps {
  jobs: Job[];
}

export default function ExpandableCard({ jobs }: ExpandableCardProps) {
  const [active, setActive] = useState<Job | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

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
    ? active.tasks.reduce((acc, task) => {
        const completionPercentage = (task.completedWorkers / task.maxWorkers) * 100;
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
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[600px] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-lg p-5 pt-6"
            >
              <div className="flex justify-between items-center mb-4 ">
                <motion.h3
                  layoutId={`title-${active.title}-${id}`}
                  className="font-bold text-neutral-700 dark:text-neutral-200 text-lg ml-3 mt-3"
                >
                  Job Name: <span className="text-blue-600">{active.title}</span>
                </motion.h3>
                <motion.p
    className={`mr-3 ${
      active.status === "completed" ? "text-green-500" : "text-yellow-500"
    }`}
  >
    Status: {active.status}
  </motion.p>
              </div>

              <div className="px-4"> <hr /></div>
            
              <div className="p-4">
                <div className="flex justify-between">
                  <strong>Job ID:</strong>
                  <span className="text-purple-500">{active.id}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Payment:</strong>
                  <span className="text-orange-500">${active.payment}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Total Tasks:</strong>
                  <span>{active.tasks.length}</span>
                </div>
              </div>
              <div className="px-4 py-2">
              <hr />
                <h4 className="font-semibold text-neutral-700 dark:text-neutral-200 mt-5">Task Completion Distribution:</h4>
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
        {jobs.map((job) => (
          <motion.div
            layoutId={`card-${job.title}-${id}`}
            key={`card-${job.title}-${id}`}
            onClick={() => setActive(job)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl cursor-pointer shadow hover:shadow-md transition-shadow duration-200
            mb-30"
          >
            <div className="flex gap-4 flex-col md:flex-row">
              <div>
                <motion.h3
                  layoutId={`title-${job.title}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                  {job.title}
                </motion.h3>
                <p className={`text-neutral-600 dark:text-neutral-400 text-center md:text-left`}>
                  Status: <span className={job.status === "completed" ? "text-green-500" : "text-yellow-500"}>{job.status}</span>
                </p>
                <p className={`text-neutral-600 dark:text-neutral-400 text-center md:text-left`}>
                  Payment: <span className="text-orange-500">${job.payment}</span>
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
