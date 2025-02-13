
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RSVPEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email }: RSVPEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required to send confirmation");
    }

    const emailResponse = await resend.emails.send({
      from: "Travis Community Conversation <onboarding@resend.dev>",
      to: [email],
      subject: "RSVP Confirmation - Travis Community Conversation",
      html: `
        <h1>Thank you for your RSVP, ${firstName}!</h1>
        <p>We've received your RSVP for the Travis Community Conversation.</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Date: Thursday, March 27, 2025</li>
          <li>Time: 7:00 PM</li>
          <li>Location: Gold Star Post, 17 Cannon Avenue, Staten Island, NY 10314</li>
        </ul>
        <p>A reminder will be sent closer to the event date.</p>
        <p>If you have any questions, please don't hesitate to reach out.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-rsvp-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
