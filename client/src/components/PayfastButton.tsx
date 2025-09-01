import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PayfastButtonProps {
  totalAmount: number;
  onSuccess?: () => void;
}

export const PayfastButton = ({ totalAmount, onSuccess }: PayfastButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.color,
        selected_size: item.size,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create PayFast form and submit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://sandbox.payfast.co.za/eng/process';
      form.target = '_top'; // Ensure it navigates the entire window
      form.style.display = 'none';

      const fields = {
        merchant_id: '10000100',
        merchant_key: '46f0cd694581a',
        amount: totalAmount.toFixed(2),
        item_name: `Order #${order.id}`,
        return_url: `${window.location.origin}/payment-success?order_id=${order.id}`,
        cancel_url: `${window.location.origin}/cart`,
        notify_url: `${window.location.origin}/api/payfast-notify`,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      
      // Use setTimeout to ensure the form is properly attached before submission
      setTimeout(() => {
        form.submit();
        // Clean up after a delay to ensure submission completes
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
        }, 1000);
      }, 100);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
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