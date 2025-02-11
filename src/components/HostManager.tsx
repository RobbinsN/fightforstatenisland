
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Host = {
  id: string;
  name: string;
  title: string;
  image_url: string;
  order_index: number;
};

export const HostManager = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Host>>({});
  const [newHost, setNewHost] = useState<Partial<Host>>({
    name: "",
    title: "",
  });
  const [uploading, setUploading] = useState(false);

  const { data: hosts = [], isLoading } = useQuery({
    queryKey: ['hosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as Host[];
    }
  });

  const handleImageUpload = async (file: File, hostId?: string) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hosts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hosts')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHost.name || !newHost.title) {
      toast.error("Please fill in all fields");
      return;
    }

    const fileInput = document.getElementById('new-host-image') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    try {
      const imageUrl = await handleImageUpload(file);
      if (!imageUrl) return;

      const { error } = await supabase
        .from('hosts')
        .insert([{
          ...newHost,
          image_url: imageUrl,
          order_index: hosts.length
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      setNewHost({ name: "", title: "" });
      fileInput.value = "";
      toast.success("Host added successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = async (host: Host) => {
    setIsEditing(host.id);
    setEditForm(host);
  };

  const handleSave = async (hostId: string) => {
    if (!editForm.name || !editForm.title) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      let imageUrl = editForm.image_url;
      const fileInput = document.getElementById(`host-image-${hostId}`) as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (file) {
        const newImageUrl = await handleImageUpload(file);
        if (newImageUrl) imageUrl = newImageUrl;
      }

      const { error } = await supabase
        .from('hosts')
        .update({ ...editForm, image_url: imageUrl })
        .eq('id', hostId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      setIsEditing(null);
      toast.success("Host updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (hostId: string) => {
    if (!confirm("Are you sure you want to delete this host?")) return;

    try {
      const { error } = await supabase
        .from('hosts')
        .delete()
        .eq('id', hostId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast.success("Host deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="space-y-4 glass p-6 rounded-lg">
        <h3 className="text-lg font-semibold">Add New Host</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="new-name">Name</Label>
            <Input
              id="new-name"
              value={newHost.name}
              onChange={(e) => setNewHost({ ...newHost, name: e.target.value })}
              className="bg-white/10"
            />
          </div>
          <div>
            <Label htmlFor="new-title">Title</Label>
            <Input
              id="new-title"
              value={newHost.title}
              onChange={(e) => setNewHost({ ...newHost, title: e.target.value })}
              className="bg-white/10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="new-host-image">Image</Label>
          <Input
            id="new-host-image"
            type="file"
            accept="image/*"
            className="bg-white/10"
          />
        </div>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Add Host"}
        </Button>
      </form>

      <div className="glass p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Manage Hosts</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hosts.map((host) => (
              <TableRow key={host.id}>
                <TableCell>
                  <img
                    src={host.image_url}
                    alt={host.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isEditing === host.id && (
                    <Input
                      id={`host-image-${host.id}`}
                      type="file"
                      accept="image/*"
                      className="mt-2 bg-white/10"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {isEditing === host.id ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-white/10"
                    />
                  ) : (
                    host.name
                  )}
                </TableCell>
                <TableCell>
                  {isEditing === host.id ? (
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="bg-white/10"
                    />
                  ) : (
                    host.title
                  )}
                </TableCell>
                <TableCell>
                  {isEditing === host.id ? (
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(host.id)}
                        disabled={uploading}
                      >
                        {uploading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(host)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(host.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
