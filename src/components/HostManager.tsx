
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ImageCropDialog } from "./ImageCropDialog";
import { SortableHostList } from "./SortableHostList";

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
  const [newHost, setNewHost] = useState({
    name: "",
    title: "",
  });
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ file: File, url: string } | null>(null);
  const [isEditingImage, setIsEditingImage] = useState<string | null>(null);

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

  const handleImageSelect = (file: File, hostId?: string) => {
    const url = URL.createObjectURL(file);
    setSelectedImage({ file, url });
    setCropDialogOpen(true);
    setIsEditingImage(hostId || null);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setUploading(true);
      const fileName = `${Math.random()}.jpg`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hosts')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hosts')
        .getPublicUrl(filePath);

      if (isEditingImage) {
        setEditForm(prev => ({ ...prev, image_url: publicUrl }));
      } else {
        // For new host
        const fileInput = document.getElementById('new-host-image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await handleAdd(publicUrl);
      }

      setSelectedImage(null);
      setCropDialogOpen(false);
      setIsEditingImage(null);
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (imageUrl?: string) => {
    if (!newHost.name || !newHost.title) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!imageUrl && !selectedImage) {
      toast.error("Please select an image");
      return;
    }

    try {
      const { error } = await supabase
        .from('hosts')
        .insert({
          name: newHost.name,
          title: newHost.title,
          image_url: imageUrl,
          order_index: hosts.length
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      setNewHost({ name: "", title: "" });
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
      const { error } = await supabase
        .from('hosts')
        .update({
          name: editForm.name,
          title: editForm.title,
          image_url: editForm.image_url
        })
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

  const handleReorder = async (reorderedHosts: Host[]) => {
    try {
      // Update each host's order_index in the database
      const updates = reorderedHosts.map((host) => ({
        id: host.id,
        order_index: host.order_index,
      }));

      const { error } = await supabase
        .from('hosts')
        .upsert(updates);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast.success("Host order updated successfully");
    } catch (error: any) {
      toast.error(error.message);
      // Refresh the list to show the original order
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4 glass p-6 rounded-lg">
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
          />
        </div>
      </form>

      <div className="glass p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Manage Hosts</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop hosts to reorder them. Changes are saved automatically.
        </p>
        <SortableHostList
          hosts={hosts}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          onEdit={handleEdit}
          onSave={handleSave}
          onDelete={handleDelete}
          onImageSelect={handleImageSelect}
          onReorder={handleReorder}
          uploading={uploading}
        />
      </div>

      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          onClose={() => {
            setCropDialogOpen(false);
            setSelectedImage(null);
            setIsEditingImage(null);
          }}
          imageUrl={selectedImage.url}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </div>
  );
};
