import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HostManager } from "@/components/HostManager";
import { CheckInManager } from "@/components/CheckInManager";
import { Badge } from "@/components/ui/badge";
import { CommentManager } from "@/components/CommentManager";

type RSVP = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  checked_in: boolean;
  checked_in_at: string | null;
};

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate]);

  const { data: rsvps, isLoading, error } = useQuery({
    queryKey: ['rsvps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RSVP[];
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
      toast.success("RSVP deleted successfully");
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
      toast.success("Attendee checked in successfully");
    } catch (error: any) {
      console.error('Check-in error:', error);
      toast.error(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-6 rounded-lg">
            <p className="text-red-500">Error loading RSVPs: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        
        <div className="space-y-8">
          {/* Hosts Management Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Manage Hosts</h2>
            <HostManager />
          </div>

          {/* Comments Management Section */}
          <div className="glass p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Questions & Comments</h2>
            <CommentManager />
          </div>

          {/* Check-in Section */}
          <div className="glass p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Check-in & Registration</h2>
              <CheckInManager />
            </div>
            
            {isLoading ? (
              <p className="text-muted-foreground">Loading RSVPs...</p>
            ) : rsvps && rsvps.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvps.map((rsvp) => (
                      <TableRow key={rsvp.id}>
                        <TableCell>{rsvp.first_name}</TableCell>
                        <TableCell>{rsvp.last_name}</TableCell>
                        <TableCell>{rsvp.email}</TableCell>
                        <TableCell>{rsvp.phone}</TableCell>
                        <TableCell>{rsvp.address}</TableCell>
                        <TableCell>
                          {rsvp.checked_in ? (
                            <Badge className="bg-green-500">
                              Checked In {rsvp.checked_in_at && `at ${formatDate(rsvp.checked_in_at)}`}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Checked In</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(rsvp.created_at)}</TableCell>
                        <TableCell>
                          <div className="space-x-2">
                            {!rsvp.checked_in && (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(rsvp.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Check In
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(rsvp.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">No RSVPs submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
