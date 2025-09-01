import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

interface PayfastButtonProps {
  totalAmount: number;
  onSuccess?: () => void;
}

export const PayfastButton = ({ totalAmount, onSuccess }: PayfastButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCart();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Only clear cart after successful payment
      if (onSuccess) {
        onSuccess();
      }
      
      console.log("Payment successful!");
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
      onClick={handlePayment}
      disabled={isProcessing}
    >
      {isProcessing ? "Processing Payment..." : `Pay with Payfast · R${totalAmount}`}
    </Button>
  );
};