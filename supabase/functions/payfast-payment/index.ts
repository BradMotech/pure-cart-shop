import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Md5 } from "https://deno.land/std@0.190.0/hash/md5.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planName, planPrice, tokens, orderItems, orderId } = await req.json();

    if (!planName || !planPrice || !orderId) {
      throw new Error("Missing required fields: planName, planPrice, orderId");
    }

    // PayFast sandbox credentials (demo)
    const merchantId = "10000100";
    const merchantKey = "46f0cd694581a";
    const passPhrase = ""; // Leave empty unless you have set one in PayFast dashboard

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Build PayFast data
    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/payment-success?order_id=${orderId}`,
      cancel_url: `${origin}/cart`,
      notify_url: `${origin}/api/payfast-notify`,
      name_first: "Customer",
      name_last: "Name",
      email_address: "customer@example.com",
      m_payment_id: orderId,
      amount: Number(planPrice).toFixed(2),
      item_name: planName || "Order Payment",
      item_description: `Payment for ${orderItems?.length || 1} item(s)`,
      custom_int1: String(tokens || 0),
      custom_str1: String(orderId),
    };

    // Generate signature (MD5) if passphrase is set
    const generateSignature = (data: Record<string, string>, passphrase = "") => {
      const keys = Object.keys(data)
        .filter((k) => k !== "signature" && data[k] !== "" && data[k] !== undefined && data[k] !== null)
        .sort();
      const paramString = keys
        .map((k) => `${k}=${encodeURIComponent(String(data[k]).trim()).replace(/%20/g, "+")}`)
        .join("&");
      const stringToHash = passphrase ? `${paramString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}` : paramString;
      const md5 = new Md5();
      md5.update(stringToHash);
      return md5.toString();
    };

    if (passPhrase) {
      paymentData.signature = generateSignature(paymentData, passPhrase);
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