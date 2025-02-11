
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      const { error } = await supabase
        .from('rsvps')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`, // Keep this for backward compatibility
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          }
        ]);

      if (error) throw error;

      toast.success("RSVP received! You will receive a confirmation email shortly.");
      setFormData({ firstName: "", lastName: "", email: "", phone: "", address: "" });
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
