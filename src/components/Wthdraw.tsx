import React from 'react';
import { Button } from "@/components/ui/button"; // Adjust this import based on your Button component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Adjust for shadcn dialog components
import { Input } from "@/components/ui/input"; // shadcn Input component
import { Label } from '@radix-ui/react-dropdown-menu';

interface WithdrawProps {
  openWithdraw: boolean;
  setOpenWithdraw: (open: boolean) => void;
  withdrawAmount: number;
  setWithdrawAmount: (amount: number) => void;
  withdrawFunds: () => Promise<never[] | undefined>; // Function to handle withdrawal logic
}

const Withdraw: React.FC<WithdrawProps> = ({ openWithdraw, setOpenWithdraw, withdrawAmount, setWithdrawAmount, withdrawFunds }) => {

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(event.target.value);
    if (!isNaN(amount)) {
      setWithdrawAmount(amount); // Update the withdraw amount if it's a valid number
    } // Update the withdraw amount
  };

  const handleSubmit = async () => {
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
            <Label>(Amount in octas 1 APT = 100,000,000 octas)
                <div className='border-2 border-slate-400 rounded-lg p-3 my-3 text-sm text-orange-400 bg-gray-800'>
                    Note! : Minimum withdrawal amount is 2000000 octas (equivalent to 0.02 APT). &nbsp;
                    <strong>So make sure you have enough octas in your account</strong>
                </div>
            </Label>
          <Input
            type="number"
            placeholder="Enter amount to withdraw"
            value={withdrawAmount}
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
