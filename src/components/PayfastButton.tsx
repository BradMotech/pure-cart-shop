import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PaymentDialog } from "./PaymentDialog";

interface PayfastButtonProps {
  totalAmount: number;
  onSuccess?: () => void;
}

export const PayfastButton = ({ totalAmount, onSuccess }: PayfastButtonProps) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  return (
    <>
      <Button 
        className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
        onClick={() => setShowPaymentDialog(true)}
      >
        Proceed to Payment · R{totalAmount.toFixed(2)}
      </Button>
      
      <PaymentDialog 
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        totalAmount={totalAmount}
      />
    </>
  );
};