
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const RSVPForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // First, create the RSVP
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          }
        ])
        .select()
        .single();

      if (rsvpError) throw rsvpError;

      // If there's a comment, create it and link it to the RSVP
      if (formData.comment.trim()) {
        const { error: commentError } = await supabase
          .from('comments')
          .insert([
            {
              first_name: formData.firstName,
              last_name: formData.lastName,
              address: formData.address,
              phone: formData.phone,
              comment: formData.comment,
              rsvp_id: rsvpData.id,
            }
          ]);

        if (commentError) throw commentError;
      }

      // Send confirmation email if email is provided
      if (formData.email) {
        try {
          const { data: emailResponse, error: emailError } = await supabase.functions.invoke(
            'send-rsvp-confirmation',
            {
              body: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
              },
            }
          );

          if (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't throw the error as we still want to show success for the RSVP
          }
        } catch (emailError) {
          console.error('Error calling email function:', emailError);
        }
      }

      toast.success("RSVP received! You will receive a confirmation email shortly.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        comment: "",
      });
    } catch (error: any) {
      console.error('RSVP submission error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass p-6 rounded-lg max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="bg-white/10"
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="bg-white/10"
            disabled={loading}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
        <div className="text-sm text-white/70 mb-2">
          Note: In-person seating is exclusively reserved for Travis residents due to limited capacity
        </div>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="bg-white/10"
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="bg-white/10"
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-white/10"
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Questions or Comments</Label>
        <Textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="bg-white/10 min-h-[100px]"
          disabled={loading}
          placeholder="Optional: Add any questions or comments you'd like to share"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-secondary text-primary hover:bg-secondary/90"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit RSVP"}
      </Button>
    </form>
  );
};
