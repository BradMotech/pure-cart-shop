import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

export const PaymentDialog = ({ isOpen, onClose, totalAmount }: PaymentDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { items } = useCart();
  const { user } = useAuth();

  const handlePayFastPayment = async () => {
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
      // Create order in Supabase first
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

      // Call PayFast edge function
      const { data, error } = await supabase.functions.invoke('payfast-payment', {
        body: {
          planName: `Order #${order.id}`,
          planPrice: totalAmount,
          tokens: 0,
          orderItems: items,
          orderId: order.id
        }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.paymentData) {
        // Create and submit form to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;
        // Don't use _blank on mobile to avoid popup blocking issues
        if (window.innerWidth >= 768) {
          form.target = '_blank'; // Open in new window on desktop only
        }
        form.style.display = 'none';

        // Add all payment data as hidden fields
        Object.entries(data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        toast({
          title: "Redirecting to PayFast",
          description: "You will be redirected to complete your payment.",
        });

        onClose();
      } else {
        throw new Error("Failed to initialize PayFast payment");
      }

    } catch (error) {
      console.error('PayFast payment error:', error);
      toast({
        title: "Payment Error",
        description: (error as Error).message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Choose Payment Method
          </DialogTitle>
          <DialogDescription>
            Select your preferred payment method to complete your purchase of R{totalAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* PayFast Payment Option */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold">PayFast Secure Payment</h4>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              You'll be redirected to PayFast's secure payment page to complete your transaction
            </p>
            
            <Button 
              onClick={handlePayFastPayment} 
              disabled={isProcessing} 
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Pay with PayFast - R{totalAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
          
          {/* Cancel Button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};