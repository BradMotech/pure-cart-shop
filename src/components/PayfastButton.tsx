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
}

export const PayfastButton = ({ totalAmount, onSuccess }: PayfastButtonProps) => {
  const { user } = useAuth();
  const { state, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
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

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items
      const orderItems = state.items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        selected_color: item.selectedColor
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      // Get user's profile for payment details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Create Payfast payment form
      const merchant_id = '10000100'; // Sandbox merchant ID
      const merchant_key = '46f0cd694581a'; // Sandbox merchant key
      const return_url = `${window.location.origin}/`;
      const cancel_url = `${window.location.origin}/cart`;
      const notify_url = `${window.location.origin}/api/payfast/notify`;
      
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
        item_name: `Order #${order.id.slice(0, 8)}`,
        item_description: `${state.items.length} items from YW Clothing Store`,
        custom_str1: user.id,
        custom_str2: order.id
      };

      // Create and submit form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://sandbox.payfast.co.za/eng/process'; // Use production URL for live
      
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
      disabled={processing || state.items.length === 0}
      className="w-full"
      size="lg"
    >
      <CreditCard className="w-5 h-5 mr-2" />
      {processing ? 'Processing...' : `Pay R${totalAmount.toFixed(2)} with Payfast`}
    </Button>
  );
};