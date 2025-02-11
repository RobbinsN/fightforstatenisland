
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const RSVPForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('rsvps')
        .insert([
          {
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          }
        ]);

      if (error) throw error;

      toast.success("RSVP received! You will receive a confirmation email shortly.");
      setFormData({ name: "", email: "", phone: "", address: "" });
    } catch (error: any) {
      console.error('RSVP submission error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass p-6 rounded-lg max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white/10"
          disabled={loading}
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
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="bg-white/10"
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
