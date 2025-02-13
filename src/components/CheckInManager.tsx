import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

type NewAttendee = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export const CheckInManager = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newAttendee, setNewAttendee] = useState<NewAttendee>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleOnSiteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendee.firstName || !newAttendee.lastName || !newAttendee.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('rsvps')
        .insert([
          {
            first_name: newAttendee.firstName,
            last_name: newAttendee.lastName,
            full_name: `${newAttendee.firstName} ${newAttendee.lastName}`,
            email: newAttendee.email,
            phone: newAttendee.phone,
            address: newAttendee.address,
            checked_in: true,
            checked_in_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
      toast.success("New attendee registered and checked in");
      setIsOpen(false);
      setNewAttendee({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Register New Attendee</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Attendee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOnSiteRegistration} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newAttendee.firstName}
                  onChange={(e) => setNewAttendee({ ...newAttendee, firstName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newAttendee.lastName}
                  onChange={(e) => setNewAttendee({ ...newAttendee, lastName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={newAttendee.phone}
                onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newAttendee.email}
                onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newAttendee.address}
                onChange={(e) => setNewAttendee({ ...newAttendee, address: e.target.value })}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register & Check In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
