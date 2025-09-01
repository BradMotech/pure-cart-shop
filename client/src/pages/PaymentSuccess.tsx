import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const { clearCart } = useCart();
  const { toast } = useToast();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const processPaymentResult = async () => {
      if (!orderId) {
        setPaymentStatus('failed');
        setIsProcessing(false);
        return;
      }

      try {
        // Check payment status with PayFast (in real implementation)
        // For now, we'll simulate successful payment
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update order status to completed
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            payment_id: `pf_${Date.now()}` // Mock payment ID
          })
          .eq('id', orderId);

        if (error) throw error;

        // Clear the cart only after successful payment confirmation
        clearCart();
        setPaymentStatus('success');
        
        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed and is being processed.",
        });
      } catch (error) {
        console.error('Payment confirmation error:', error);
        setPaymentStatus('failed');
        
        toast({
          title: "Payment Error",
          description: "There was an issue confirming your payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentResult();
  }, [orderId, clearCart, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold mb-4">Processing Payment...</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        {paymentStatus === 'success' ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
            <div className="space-y-4">
              <Link to="/">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                  Continue Shopping
                </Button>
              </Link>
              <Link to="/account">
                <Button variant="ghost" className="w-full">
                  View Order History
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 text-foreground">Payment Failed</h1>
            <p className="text-muted-foreground mb-8">
              There was an issue processing your payment. Your cart has been preserved.
            </p>
            <div className="space-y-4">
              <Link to="/cart">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                  Return to Cart
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;