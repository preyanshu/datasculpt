"use-client";


import { AptosClient } from "aptos";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import config from "@/context/config"

const NODE_URL = config.NODE_URL;
const client = new AptosClient(NODE_URL);

const moduleAddress = config.MODULE_ADDRESS;

const { account, signAndSubmitTransaction } = useWallet();

export const register = async () => {
    if (!account) {
      console.log("connect your wallet");
      return [];
    }
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::user_registry::register_user`,
        functionArguments: ["test creator2", 1]
      }
    }
    try {
      const response = await signAndSubmitTransaction(transaction);
      console.log("Created.", response)
      await client.waitForTransaction(response.hash);
    } catch (error) {
      console.log(error)
    }
  }

export const getUserProfile = async (address: string | undefined) => {
    if (!address) {
      console.log("Address is not valid");
      return null;
    }
    const payload = {
      function: `${moduleAddress}::user_registry::get_user_profile`,
      type_arguments: [],
      arguments: [address]
    }
    try {
      const userData = await client.view(payload);
      console.log(userData);
      return userData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }