import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planName, planPrice, tokens, orderItems, orderId } = await req.json();

    // PayFast sandbox credentials
    const merchantId = '10000100';
    const merchantKey = '46f0cd694581a';
    const passPhrase = 'jt7NOE43FZPn'; // PayFast test passphrase

    // Get current origin for return URLs
    const origin = req.headers.get('origin') || 'http://localhost:8080';
    
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/payment-success?order_id=${orderId}`,
      cancel_url: `${origin}/cart`,
      notify_url: `${origin}/api/payfast-notify`,
      name_first: 'Customer',
      name_last: 'Name',
      email_address: 'customer@example.com',
      m_payment_id: orderId,
      amount: planPrice.toFixed(2),
      item_name: planName || 'Order Payment',
      item_description: `Payment for ${orderItems?.length || 1} item(s)`,
      custom_int1: tokens || 0,
      custom_str1: orderId,
    };

    // Generate signature for PayFast
    const generateSignature = (data: Record<string, any>, passPhrase: string) => {
      // Create parameter string
      let pfParamString = '';
      for (const key in data) {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
          pfParamString += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
        }
      }
      
      // Remove last ampersand
      pfParamString = pfParamString.slice(0, -1);
      
      if (passPhrase) {
        pfParamString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
      }

      console.log('Parameter string:', pfParamString);
      
      // Create signature using crypto
      const encoder = new TextEncoder();
      const data_encoded = encoder.encode(pfParamString);
      
      return crypto.subtle.digest('MD5', data_encoded).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      });
    };

    const signature = await generateSignature(paymentData, passPhrase);
    paymentData.signature = signature;

    const response = {
      success: true,
      paymentUrl: 'https://sandbox.payfast.co.za/eng/process',
      paymentData: paymentData
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('PayFast payment error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});