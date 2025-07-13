import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://ocds-api.etenders.gov.za';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let path, params;

    if (req.method === 'GET') {
      // Handle GET requests with query parameters
      const url = new URL(req.url);
      path = url.searchParams.get('path');
      params = url.searchParams.get('params');
    } else {
      // Handle POST requests with JSON body
      const body = await req.json();
      path = body.path;
      params = body.params;
    }
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Path parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Construct the target URL
    let targetUrl = `${BASE_URL}${path}`;
    if (params) {
      targetUrl += `?${params}`;
    }

    console.log('Proxying request to:', targetUrl);

    // Make the request to the eTenders API
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in etenders-proxy function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch data from eTenders API' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});