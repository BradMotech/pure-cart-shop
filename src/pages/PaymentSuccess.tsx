import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  useEffect(() => {
    const processPaymentSuccess = async () => {
      const paymentId = searchParams.get('pf_payment_id');
      const orderId = searchParams.get('m_payment_id');
      
      if (orderId && paymentId) {
        try {
          // Update existing order status to paid
          const { error: updateError } = await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              payment_id: paymentId 
            })
            .eq('id', orderId);

          if (updateError) {
            throw updateError;
          }
          
          // Clear cart after successful payment
          clearCart();
          
          toast({
            title: "Payment successful!",
            description: "Your order has been processed successfully"
          });

        } catch (error) {
          console.error('Error processing payment success:', error);
          toast({
            title: "Error",
            description: "There was an error processing your order. Please contact support.",
            variant: "destructive"
          });
        }
      }
    };

    processPaymentSuccess();
  }, [searchParams, clearCart]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/')} className="w-full">
              Continue Shopping
            </Button>
            <Button onClick={() => navigate('/account')} variant="outline" className="w-full">
              View Order History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default PaymentSuccess;