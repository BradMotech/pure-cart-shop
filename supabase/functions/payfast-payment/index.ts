import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const { planName, planPrice, tokens, orderItems, orderId } = await req.json();

    if (!planName || !planPrice || !orderId) {
      throw new Error("Missing required fields: planName, planPrice, orderId");
    }

    // PayFast sandbox credentials (demo)
    const merchantId = "10000100";
    const merchantKey = "46f0cd694581a";
    const passPhrase = ""; // Leave empty unless you've set a passphrase in PayFast

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/payment-success?order_id=${orderId}`,
      cancel_url: `${origin}/cart`,
      // Public Edge Function URL so PayFast can reach it
      notify_url: `https://tindaknujaloljfthmum.supabase.co/functions/v1/payfast-notify`,
      name_first: "Customer",
      name_last: "Name",
      email_address: "customer@example.com",
      m_payment_id: String(orderId),
      amount: Number(planPrice).toFixed(2),
      item_name: planName || "Order Payment",
      item_description: `Payment for ${orderItems?.length || 1} item(s)`,
      custom_int1: String(tokens || 0),
      custom_str1: String(orderId),
    };

    // No signature generation in sandbox unless passphrase is configured
    if (passPhrase) {
      // We intentionally skip MD5 hashing to avoid unsupported algorithms in Deno runtime
      // When you add a passphrase in PayFast dashboard, we can add a stable MD5 implementation
    }

    return new Response(
      JSON.stringify({ success: true, paymentUrl: "https://sandbox.payfast.co.za/eng/process", paymentData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("PayFast payment error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Payment initialization failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});