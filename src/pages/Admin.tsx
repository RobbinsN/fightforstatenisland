
import { useEffect, useState } from "react";
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

type RSVP = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
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

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
      toast.success("RSVP deleted successfully");
    } catch (error: any) {
      console.error('Delete error:', error);
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
        
        <div className="glass p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">RSVP Submissions</h2>
          
          {isLoading ? (
            <p className="text-muted-foreground">Loading RSVPs...</p>
          ) : rsvps && rsvps.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rsvps.map((rsvp) => (
                    <TableRow key={rsvp.id}>
                      <TableCell>{rsvp.full_name}</TableCell>
                      <TableCell>{rsvp.email}</TableCell>
                      <TableCell>{rsvp.phone}</TableCell>
                      <TableCell>{rsvp.address}</TableCell>
                      <TableCell>{formatDate(rsvp.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(rsvp.id)}
                        >
                          Delete
                        </Button>
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
  );
}
