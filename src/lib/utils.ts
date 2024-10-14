import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { HexString } from "aptos";

// Function to check if two Aptos addresses are the same
export function areAddressesEqual(addr1: string, addr2: string): boolean {
  const hexAddr1 = HexString.ensure(addr1);
  const hexAddr2 = HexString.ensure(addr2);

  // Compare their string representations
  return hexAddr1.toShortString() === hexAddr2.toShortString();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
