import React from 'react';
import { Button } from "@/components/ui/button"; // Adjust this import based on your Button component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Adjust for shadcn dialog components
import { Input } from "@/components/ui/input"; // shadcn Input component
import { Label } from '@radix-ui/react-dropdown-menu';
import { useToast } from './ui/use-toast';

interface WithdrawProps {
  openWithdraw: boolean;
  setOpenWithdraw: (open: boolean) => void;
  withdrawAmount: string; // Now it's a string to handle input directly as text
  setWithdrawAmount: (amount: string) => void; // Update function to handle string input
  withdrawFunds: () => Promise<never[] | undefined>; // Function to handle withdrawal logic
}

const Withdraw: React.FC<WithdrawProps> = ({ openWithdraw, setOpenWithdraw, withdrawAmount, setWithdrawAmount, withdrawFunds }) => {

   const {toast} = useToast();

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value;
    setWithdrawAmount(amount); // Store the value as a string
  };

  const handleSubmit = async () => {
    // Validate the input by converting to a number
    const parsedAmount = parseFloat(withdrawAmount);
    
    if (isNaN(parsedAmount) || parsedAmount < 0.2) {
      // alert("Please enter a valid amount. Minimum withdrawal is 0.2 APT.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount. Minimum withdrawal is 0.2 APT.",
      })
      return;
    }
    
    // Convert to proper integer (or decimal value in your case)
    const formattedAmount = parsedAmount * 1e8; // Assuming conversion for APT tokens
    
    console.log(`Withdraw Amount in APT smallest unit: ${formattedAmount}`);
    
    await withdrawFunds(); // Trigger withdrawal logic
    setOpenWithdraw(false); // Close modal after withdrawing
  };

  return (
    <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
            <Label>
                <div className='border-2 border-slate-400 rounded-lg p-3 my-3 text-sm text-orange-400 bg-gray-800'>
                    Note! : Minimum withdrawal amount is 0.2 APT. &nbsp;
                    <strong>So make sure you have enough APT coins in your account</strong>
                </div>
            </Label>
          <Input
            type='text' // Accept as text, so we can handle the string input
            placeholder="Enter amount to withdraw"
            value={ withdrawAmount || ""} // Default empty string if it's "0"
            onChange={handleAmountChange}
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpenWithdraw(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSubmit}>
            Withdraw
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Withdraw;
