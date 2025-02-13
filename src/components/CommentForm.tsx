
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type CommentFormProps = {
  rsvpId?: string;
  onSuccess?: () => void;
};

export const CommentForm = ({ rsvpId, onSuccess }: CommentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.comment) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            phone: formData.phone,
            comment: formData.comment,
            rsvp_id: rsvpId,
          }
        ]);

      if (error) throw error;

      toast.success("Comment submitted successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        address: "",
        phone: "",
        comment: "",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Comment submission error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
            disabled={loading}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Comment <span className="text-red-500">*</span></Label>
        <Textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          disabled={loading}
          required
          className="min-h-[100px]"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Comment"}
      </Button>
    </form>
  );
};
