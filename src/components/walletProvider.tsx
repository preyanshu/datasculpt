"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { useToast } from "./ui/use-toast";


export const WalletProvider = ({ children }: PropsWithChildren) => {

const { toast } = useToast()
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.DEVNET,
      }}
      onError={(error) => {
        console.log(error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "There is some issue with wallet connection please check your internet connection and reconnect your wallet",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
