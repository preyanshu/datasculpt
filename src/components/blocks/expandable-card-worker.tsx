import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Chart from "react-apexcharts";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface Task {
  id: number;
  title: string;
  description: string;
  payment: number;
  responses: (string | string[])[][]; // Array of arrays of strings
}

interface ExpandableCardProps {
  completedTasks: Task[];
}

export default function ExpandableCard({ completedTasks }: ExpandableCardProps) {
  const [active, setActive] = useState<Task | null>(null);
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

  const calculateResponseCounts = (responses: (string | string[])[][]) => {
    const responseMap: Record<string, number> = {};

    responses.forEach((group) => {
      group.forEach((response) => {
        const key = typeof response === "string" ? response : response[0];
        responseMap[key] = (responseMap[key] || 0) + 1;
      });
    });

    return responseMap;
  };

  const totalResponses = active ? active.responses.flat().length : 0;
  const responseCounts = active ? calculateResponseCounts(active.responses) : {};
  const labels = Object.keys(responseCounts);
  const series = Object.values(responseCounts).map(
    (count) => (count / totalResponses) * 100
  );

  // Function to wrap text for pie chart labels
  const wrapLabel = (label: string) => {
    const maxLength = 10; // Set maximum length for a single line
    if (label.length <= maxLength) return label;
    const wrapped = label.match(/.{1,10}/g); // Split label into chunks
    return wrapped ? wrapped.join('<br/>') : label; // Join chunks with line breaks
  };

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
              <div className="flex justify-between items-center mb-4">
                <motion.h3
                  layoutId={`title-${active.title}-${id}`}
                  className="font-bold text-neutral-700 dark:text-neutral-200 text-lg ml-3 mt-3"
                >
                  Task: <span className="text-blue-600">{active.title}</span>
                </motion.h3>
              </div>

              <div className="px-4">
                <hr />
              </div>

              <div className="p-4">
                <div className="flex justify-between">
                  <strong className="mr-3 mb-3">Task Description:</strong>
                  <span className="text-purple-500 overflow-wrap break-word">{active.description}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Payment:</strong>
                  <span className="text-green-500">+0.05 sol</span>
                </div>
                <div className="flex justify-between mt-2">
                  <strong>Total Responses:</strong>
                  <span>{totalResponses}</span>
                </div>
              </div>
              <div className="px-4 py-2">
                <hr />
                <h4 className="font-semibold text-neutral-700 dark:text-neutral-200 mt-5">
                  User Responses:
                </h4>
                {totalResponses > 0 ? (
                  <Chart
                    options={{
                      chart: {
                        type: "pie",
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      labels: labels.map(wrapLabel), // Wrap long labels here
                      plotOptions: {
                        pie: {
                          expandOnClick: true,
                        },
                      },
                      fill: {
                        colors: ["#10AA77", "#FF4560", "#FEB019", "#775DD0"],
                      },
                      dataLabels: {
                        enabled: true,
                        formatter: (val: number) => `${val.toFixed(1)}%`,
                        style: {
                          colors: ["#FFFFFF"],
                        },
                      },
                      theme: {
                        mode: 'dark',
                      },
                    }}
                    series={series}
                    type="pie"
                    height={250}
                  />
                ) : (
                  <p>No responses yet.</p>
                )}
              </div>
         
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="mx-auto w-full gap-4 ">
        {completedTasks.map((task) => (
          <motion.div
            layoutId={`card-${task.title}-${id}`}
            key={`card-${task.title}-${id}-${task.description}`}
            onClick={() => setActive(task)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl cursor-pointer shadow hover:shadow-md transition-shadow duration-200 
             mb-[20px] "
          >
            <div className="flex gap-4 flex-row md:flex-row justify-between align-between w-full ">
              <div>
                <motion.h3
                  layoutId={`title-${task.title}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                  {task.title}
                </motion.h3>
                <p className={`text-neutral-600 dark:text-neutral-400 text-center md:text-left `}>
                  Status: <span className="text-green-500">Completed</span>
                </p>
              </div>

              <p className={`text-neutral-600 dark:text-neutral-400 text-center md:text-left mt-3`}>
                  <span className="text-green-500 ">+0.05 APT</span>
                </p>

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
}
