"use client"; // Ensures that this component is only rendered on the client

import Link from 'next/link';
import style from 'styled-jsx/style';

interface RoleSwitcherProps {
  role: "worker" | "creator";  // Prop to determine the role
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ role }) => {
//   const router = useRouter();

  if (role === "worker") {
    return (
      <div className="flex font-sans flex-col items-center justify-center h-full">
        <dotlottie-player 
        src="https://lottie.host/d9fbdff3-6c05-4e88-b021-8053cca5d22d/jBSd5vVuHv.json" 
        background="transparent" 
        speed="1" 
        style={{ width: '200px', height: '200px' }} 
        autoplay 
      />
        <h1 className="text-3xl font-semibold text-center mb-4">
        You are currently in Worker mode.
        </h1>
        <p className="text-yellow-500 text-sm mb-6 text-center">
          You can either switch to Creator mode or visit your Worker Dashboard.
        </p>
        
        <div className="flex gap-4">   
        <Link href="/worker/tasks">    
          <button
            // onClick={() => router.push("/worker/tasks")}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 transition-all"
          >
            Go to Worker Dashboard
          </button>
          </Link>
        </div>
      </div>
    );
  }

  if (role === "creator") {
    return (
        <div className="flex font-sans flex-col items-center justify-center h-full">
        <dotlottie-player 
        src="https://lottie.host/d9fbdff3-6c05-4e88-b021-8053cca5d22d/jBSd5vVuHv.json" 
        background="transparent" 
        speed="1" 
        style={{ width: '200px', height: '200px' }} 
        autoplay 
      />
        <h1 className="text-3xl font-semibold text-center mb-4">
        You are currently in Creator mode.
        </h1>

        <p className="text-yellow-500 text-sm mb-6 text-center">
         You can either switch to Worker mode or visit your Creator Dashboard.
        </p>
        
        <div className="flex gap-4"> 
        <Link href="/creators/tasks">     
          <button
            // onClick={() => router.push("/worker/tasks")}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 transition-all"
          >
            Go to Creator Dashboard
          </button>
          </Link>
        </div>
      </div>
    );
  }

  // Default case if the role is neither 'worker' nor 'creator'
  return <div>No role specified</div>;
};

export default RoleSwitcher;
