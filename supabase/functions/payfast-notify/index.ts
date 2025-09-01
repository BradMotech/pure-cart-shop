import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("PayFast notification received");

    // Parse form data sent by PayFast
    const formData = await req.formData();
    const notificationData: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      notificationData[key] = String(value);
    }

    console.log("PayFast notification data:", notificationData);

    // NOTE: For now we simply acknowledge the notification.
    // If you want to verify and update orders, we can extend this later.

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("PayFast notification processing error:", error);
    // Still return OK to prevent repeated retries
    return new Response("OK", { status: 200, headers: corsHeaders });
  }
});