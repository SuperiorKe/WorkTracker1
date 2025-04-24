// @ts-ignore // Ignoring TS error for Deno Deploy
const africastalking = {
  apiKey: Deno.env.get('AFRICAS_TALKING_API_KEY'),
  username: Deno.env.get('AFRICAS_TALKING_USERNAME'),
  senderId: Deno.env.get('AFRICAS_TALKING_SENDER_ID'),
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSPayload {
  phone: string;
  message: string;
}

async function sendSMS(phone: string, message: string) {
  const url = 'https://api.africastalking.com/version1/messaging';
  
  console.log('Sending SMS with config:', {
    username: africastalking.username,
    senderId: africastalking.senderId,
    phone,
    messageLength: message.length
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apiKey': africastalking.apiKey || '',
    },
    body: new URLSearchParams({
      username: africastalking.username || '',
      to: phone,
      message,
      from: africastalking.senderId || '',
    }),
  });

  const responseData = await response.json();
  console.log('AfricasTalking API response:', responseData);

  if (!response.ok) {
    throw new Error(`Failed to send SMS: ${response.statusText}. Response: ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, message }: SMSPayload = await req.json();

    if (!phone || !message) {
      throw new Error('Phone number and message are required');
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number format');
    }

    const result = await sendSMS(phone, message);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});