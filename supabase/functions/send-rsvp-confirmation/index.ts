
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
  phone: string;
  comment?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, comment }: RSVPEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required to send confirmation");
    }

    const emailResponse = await resend.emails.send({
      from: "Travis Community Conversation <onboarding@resend.dev>",
      to: [email],
      subject: "RSVP Confirmation - Travis Community Conversation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #1a1a1a; margin-bottom: 24px;">RSVP Confirmation</h2>
          
          <p style="margin-bottom: 16px;">Dear ${firstName},</p>

          <p style="margin-bottom: 16px;">Thank you for your RSVP. We look forward to seeing you at the Travis Community Conversation on Thursday, March 27, 2025, at 7:00 PM at the Gold Star Post, 17 Cannon Ave, Staten Island, NY, 10314.</p>

          <div style="background-color: #f8f8f8; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Your RSVP Details:</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
            ${comment ? `<p style="margin: 8px 0;"><strong>Your Question/Comment:</strong><br>${comment}</p>` : ''}
          </div>

          <div style="background-color: #fff3cd; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0;"><strong>⚠ Important Notes:</strong></p>
            <ul style="margin: 8px 0;">
              <li>Please bring a valid photo ID that includes your address to verify residency upon arrival.</li>
              <li>An RSVP does not guarantee entry. Seating is first come, first served until we reach capacity.</li>
              <li>We encourage you to arrive early to secure your spot.</li>
            </ul>
          </div>

          <p style="margin-bottom: 16px;">As a reminder, this event is intended for Travis residents only. To ensure a productive discussion, off-topic questions may not be addressed publicly.</p>

          <p style="margin-bottom: 16px;">For those unable to attend in person, the event will be livestreamed at TravisConversation.com.</p>

          <p style="margin-bottom: 16px;">If you have any questions, please contact our office at <a href="tel:718-370-1384" style="color: #0066cc;">718-370-1384</a>.</p>

          <p style="margin-bottom: 16px;">We appreciate your participation and look forward to an informative discussion.</p>

          <p style="margin-bottom: 8px;">Best,</p>
          <p style="margin-top: 0;">Assemblyman Sam Pirozzolo</p>
        </div>
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
