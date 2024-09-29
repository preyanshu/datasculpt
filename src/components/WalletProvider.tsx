"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { toast } from "react-toastify";


export const WalletProvider = ({ children }: PropsWithChildren) => {


  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.DEVNET,
      }}
      onError={(error) => {
        toast.error("Error: " + error);
        console.log({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};