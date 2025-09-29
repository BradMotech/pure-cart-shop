import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 Payfast notification received')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse form data from Payfast
    const formData = await req.formData()
    const data: any = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    console.log('📋 Payfast data:', data)

    const paymentStatus = data.payment_status
    const orderId = data.custom_str2 || data.m_payment_id
    const paymentId = data.pf_payment_id

    console.log('💳 Payment info:', { paymentStatus, orderId, paymentId })

    if (paymentStatus === 'COMPLETE' && orderId) {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentId
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('❌ Failed to update order:', updateError)
        throw updateError
      }

      console.log('✅ Order updated to paid:', orderId)
    }

    return new Response('OK', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })

  } catch (error) {
    console.error('❌ Payfast notification error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})