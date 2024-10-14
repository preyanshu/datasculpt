"use client";
import React, { useState } from "react";
import { AptosClient } from "aptos";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"; // Adjust for your Input component
import { Label } from "@/components/ui/label"; // Adjust for your Label component
import { Button } from "@/components/ui/button"; // Adjust for your Button component
import { useToast } from "./ui/use-toast";
import config from "@/context/config"

const NODE_URL = config.NODE_URL;
const client = new AptosClient(NODE_URL);

const moduleAddress = config.MODULE_ADDRESS;

interface RegisterWorkerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: string;
}

const Register: React.FC<RegisterWorkerProps> = ({ open, setOpen, user }) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [name, setName] = useState("");
  const [role, setRole] = useState(user === "creator" ? "1" : "2");
  const {toast} = useToast();


  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const register = async () => {
    if (!account) {
      console.log("Connect your wallet");
      return;
    }

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::user_registry::register_user`,
        functionArguments: [name, parseInt(role)],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      console.log("Created.", response);
      await client.waitForTransaction(response.hash);
      toast({
        title: "Success",
        description: "Resgistration successfull.",
      });
    } catch (error) {
      console.log(error);
      toast({variant: "destructive",
        title: "Error",
        description: error ? "" + error :  "There may be some issues with wallet connection, please reload/reconnect your wallet properly the page and try again"});
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await register();
    setOpen(false);
  };

  return (
    <div
   
      className={cn(
        "max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-neutral-800",
        { hidden: !open }
      )}
    
    >
      <h2 className="font-bold text-2xl text-neutral-800 dark:text-neutral-200">
        Register as a {user}
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Fill in the details to complete your registration.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="name">Wallet</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            disabled
            value={account?.address}
            onChange={handleNameChange}
            required
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </LabelInputContainer>

        {/* <div className="space-y-2 mb-4">
          {user === "creator" ? (
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="creator"
                name="role"
                value="1"
                checked={role === "1"}
                onChange={handleRoleChange}
              />
              <label htmlFor="creator">Creator</label>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="worker"
                name="role"
                value="2"
                checked={role === "2"}
                onChange={handleRoleChange}
              />
              <label htmlFor="worker">Worker</label>
            </div>
          )}
        </div> */}

        <Button
          className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-full h-10 font-medium shadow-input rounded-md"
          type="submit"
        >
          Submit &rarr;
        </Button>
      </form>
    </div>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default Register;
