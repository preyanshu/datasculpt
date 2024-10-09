
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
    
);
  const [jobs, setJobs] = useState([]);

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
