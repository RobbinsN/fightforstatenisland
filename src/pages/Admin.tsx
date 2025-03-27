import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HostManager } from "@/components/HostManager";
import { CheckInManager } from "@/components/CheckInManager";
import { CommentManager } from "@/components/CommentManager";
import { EventManager } from "@/components/EventManager";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Trash } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }

      supabase.rpc('is_admin', {
        user_id: session.user.id
      }).then(({ data: isAdmin, error: adminError }) => {
        if (adminError || !isAdmin) {
          handleSignOut();
        }
        setLoading(false);
      });
    });

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

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="rsvps">RSVPs & Check-in</TabsTrigger>
            <TabsTrigger value="hosts">Hosts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="glass p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Event Management</h2>
              <EventManager />
            </div>
          </TabsContent>

          <TabsContent value="rsvps" className="space-y-4">
            <div className="glass p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Check-in & Registration</h2>
                <div className="flex gap-2">
                  <CheckInManager />
                </div>
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

  const totalRegistrations = rsvps.length;
  const totalCheckedIn = rsvps.filter(rsvp => rsvp.checked_in).length;

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
      toast.success("Registration deleted successfully");
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error.message);
    },
  });

  const handleCheckIn = (id: string) => {
    checkInMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadCSV = () => {
    if (rsvps.length === 0) {
      toast.error("No registrations to download");
      return;
    }
    
    const headers = ["Full Name", "Email", "Phone", "Address", "Registered Date", "Check-in Status", "Check-in Time"];
    
    const csvData = rsvps.map(rsvp => [
      rsvp.full_name,
      rsvp.email || "N/A",
      rsvp.phone,
      rsvp.address,
      new Date(rsvp.created_at).toLocaleDateString(),
      rsvp.checked_in ? "Checked In" : "Not Checked In",
      rsvp.checked_in_at ? new Date(rsvp.checked_in_at).toLocaleString() : "N/A"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => 
        `"${String(cell).replace(/"/g, '""')}`
      ).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Registrations downloaded successfully");
  };

  if (isLoading) {
    return <div>Loading RSVPs...</div>;
  }

  return (
    <div>
      <div className="glass mb-6 p-4 rounded-lg grid grid-cols-2 gap-4">
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-white/60 mb-1">Total Registrations</h3>
          <p className="text-3xl font-bold">{totalRegistrations}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-white/60 mb-1">Checked In</h3>
          <p className="text-3xl font-bold">{totalCheckedIn} <span className="text-sm text-white/60">({totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}%)</span></p>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Registrations ({rsvps.length})</h3>
        <Button 
          onClick={handleDownloadCSV} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>
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
                <div className="flex items-center gap-2">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500 cursor-pointer"
                        onClick={() => handleDelete(rsvp.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
