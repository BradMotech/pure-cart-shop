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
      const paymentRef = searchParams.get('custom_str2');
      
      if (paymentId && paymentRef) {
        try {
          // Get pending order data from localStorage
          const pendingOrderData = localStorage.getItem('pendingOrder');
          if (!pendingOrderData) {
            toast({
              title: "Error",
              description: "No pending order found",
              variant: "destructive"
            });
            return;
          }

          const orderData = JSON.parse(pendingOrderData);
          
          // Create order in database
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
              user_id: orderData.userId,
              email: orderData.userEmail,
              products: orderData.items,
              total_amount: orderData.totalAmount,
              status: 'paid',
              payment_id: paymentId,
              delivery_phone: orderData.deliveryDetails?.phone,
              delivery_email: orderData.deliveryDetails?.email,
              delivery_address: orderData.deliveryDetails?.address,
              delivery_city: orderData.deliveryDetails?.city,
              delivery_province: orderData.deliveryDetails?.province,
              delivery_postal_code: orderData.deliveryDetails?.postalCode
            }])
            .select()
            .single();

          if (orderError) {
            throw orderError;
          }

          // Create order items
          const orderItems = orderData.items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product.id,
            product_name: item.product.name,
            product_image: item.product.image_url,
            quantity: item.quantity,
            price: item.product.price,
            selected_color: item.selectedColor,
            selected_size: item.selectedSize
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            throw itemsError;
          }

          // Clear pending order data and cart
          localStorage.removeItem('pendingOrder');
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