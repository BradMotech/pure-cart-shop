import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Proxying PDF request to:', targetUrl);

    // Make the request to the target URL
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    // Check if response is actually a PDF
    const contentType = response.headers.get('content-type') || '';
    const isLikelyPDF = contentType.includes('application/pdf') || 
                       contentType.includes('application/octet-stream') ||
                       targetUrl.toLowerCase().includes('.pdf');

    if (!isLikelyPDF) {
      throw new Error('Response does not appear to be a PDF document');
    }

    // Get the PDF content as array buffer
    const pdfBuffer = await response.arrayBuffer();
    
    // Return the PDF with proper headers
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error in pdf-proxy function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch PDF document',
      details: 'This may be due to CORS restrictions or the document may not be accessible.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});