
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HostManager } from "@/components/HostManager";
import { CheckInManager } from "@/components/CheckInManager";
import { CommentManager } from "@/components/CommentManager";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }

      // Verify admin status
      supabase.rpc('is_admin', {
        user_id: session.user.id
      }).then(({ data: isAdmin, error: adminError }) => {
        if (adminError || !isAdmin) {
          handleSignOut();
        }
        setLoading(false);
      });
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

        <Tabs defaultValue="rsvps" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="rsvps">RSVPs & Check-in</TabsTrigger>
            <TabsTrigger value="hosts">Hosts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="rsvps" className="space-y-4">
            <div className="glass p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Check-in & Registration</h2>
                <CheckInManager />
              </div>
              <div className="mt-6">
                <RSVPManager />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hosts" className="space-y-4">
            <div className="glass p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Manage Hosts</h2>
              <HostManager />
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="glass p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Questions & Comments</h2>
              <CommentManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const RSVPManager = () => {
  const queryClient = useQueryClient();

  const { data: rsvps = [], isLoading } = useQuery({
    queryKey: ['rsvps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const checkInMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rsvps')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
      toast.success("Attendee checked in successfully");
    },
    onError: (error: any) => {
      console.error('Check-in error:', error);
      toast.error(error.message);
    },
  });

  const handleCheckIn = (id: string) => {
    checkInMutation.mutate(id);
  };

  if (isLoading) {
    return <div>Loading RSVPs...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rsvps.map((rsvp: any) => (
          <TableRow key={rsvp.id}>
            <TableCell>{rsvp.full_name}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <p>{rsvp.phone}</p>
                {rsvp.email && (
                  <p className="text-sm text-muted-foreground">{rsvp.email}</p>
                )}
                <p className="text-sm text-muted-foreground">{rsvp.address}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={rsvp.checked_in ? "default" : "outline"}>
                {rsvp.checked_in ? "Checked In" : "Not Checked In"}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(rsvp.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {!rsvp.checked_in && (
                <Button
                  size="sm"
                  onClick={() => handleCheckIn(rsvp.id)}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={checkInMutation.isPending}
                >
                  {checkInMutation.isPending ? "Checking In..." : "Check In"}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
