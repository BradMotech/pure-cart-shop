import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';

interface PayfastButtonProps {
  totalAmount: number;
  onSuccess?: () => void;
  deliveryDetails?: {
    phone: string;
    email: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
}

export const PayfastButton = ({ totalAmount, onSuccess, deliveryDetails }: PayfastButtonProps) => {
  const { user } = useAuth();
  const { state, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    // Prevent multiple rapid clicks
    if (processing) {
      console.log('⚠️ Payment already in progress, ignoring click');
      return;
    }
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with payment",
        variant: "destructive"
      });
      return;
    }

    if (state.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    console.log('🚀 PayfastButton - Starting payment process');

    try {
      // Get user's profile for payment details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Create order with pending status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          email: profile?.email || user.email,
          products: state.items,
          total_amount: totalAmount,
          status: 'pending',
          delivery_phone: deliveryDetails?.phone,
          delivery_email: deliveryDetails?.email,
          delivery_address: deliveryDetails?.address,
          delivery_city: deliveryDetails?.city,
          delivery_province: deliveryDetails?.province,
          delivery_postal_code: deliveryDetails?.postalCode
        }])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order creation failed:', orderError);
        throw orderError;
      }
      
      console.log('✅ Order created successfully:', order.id);

      // Create order items
      const orderItems = state.items.map((item) => ({
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
        console.error('❌ Order items creation failed:', itemsError);
        throw itemsError;
      }
      
      console.log('✅ Order items created successfully:', orderItems.length, 'items');

      // Create Payfast payment form
      const merchant_id = '31303781'; // real merchant ID
      const merchant_key = 'k8jdwm8jgjz5e'; // real merchant key
      const return_url = `${window.location.origin}/payment-success`;
      const cancel_url = `${window.location.origin}/cart`;
      const notify_url = `https://tindaknujaloljfthmum.supabase.co/functions/v1/payfast-notify`;
      
      const paymentData = {
        merchant_id,
        merchant_key,
        return_url,
        cancel_url,
        notify_url,
        name_first: profile?.full_name?.split(' ')[0] || 'Customer',
        name_last: profile?.full_name?.split(' ').slice(1).join(' ') || '',
        email_address: user.email || '',
        m_payment_id: order.id,
        amount: totalAmount.toFixed(2),
        item_name: 'Yewa Fashion Order',
        item_description: `Order for ${state.items.length} items`,
        custom_str1: user.id,
        custom_str2: order.id
      };

      // Create and submit form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.payfast.co.za/eng/process';
      
      Object.entries(paymentData).forEach(([key, value]) => {
        if (value) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value.toString();
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "An error occurred while processing payment",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={processing || state.items.length === 0 || !deliveryDetails}
      className="w-full"
      size="lg"
    >
      <CreditCard className="w-5 h-5 mr-2" />
      {processing ? 'Processing...' : !deliveryDetails ? 'Complete delivery details first' : `Pay R${totalAmount.toFixed(2)} with Payfast`}
    </Button>
  );
};