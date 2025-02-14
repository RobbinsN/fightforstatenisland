
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GripVertical } from "lucide-react";

type Host = {
  id: string;
  name: string;
  title: string;
  image_url: string;
  order_index: number;
};

interface SortableItemProps {
  host: Host;
  isEditing: boolean;
  editForm: Partial<Host>;
  setEditForm: (form: Partial<Host>) => void;
  onEdit: (host: Host) => void;
  onSave: (hostId: string) => void;
  onDelete: (hostId: string) => void;
  onImageSelect: (file: File, hostId: string) => void;
  uploading: boolean;
}

function SortableItem({
  host,
  isEditing,
  editForm,
  setEditForm,
  onEdit,
  onSave,
  onDelete,
  onImageSelect,
  uploading,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: host.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none"
            onClick={(e) => e.preventDefault()}
          >
            <GripVertical className="h-5 w-5 text-gray-500" />
          </button>
          <img
            src={host.image_url}
            alt={host.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        {isEditing === host.id && (
          <Input
            id={`host-image-${host.id}`}
            type="file"
            accept="image/*"
            className="mt-2 bg-white/10"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageSelect(file, host.id);
            }}
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
              onClick={() => onSave(host.id)}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditForm({})}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(host)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(host.id)}
            >
              Delete
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

interface SortableHostListProps {
  hosts: Host[];
  isEditing: string | null;
  editForm: Partial<Host>;
  setEditForm: (form: Partial<Host>) => void;
  onEdit: (host: Host) => void;
  onSave: (hostId: string) => void;
  onDelete: (hostId: string) => void;
  onImageSelect: (file: File, hostId: string) => void;
  onReorder: (hosts: Host[]) => void;
  uploading: boolean;
}

export function SortableHostList({
  hosts,
  isEditing,
  editForm,
  setEditForm,
  onEdit,
  onSave,
  onDelete,
  onImageSelect,
  onReorder,
  uploading,
}: SortableHostListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = hosts.findIndex((host) => host.id === active.id);
      const newIndex = hosts.findIndex((host) => host.id === over.id);
      const newHosts = arrayMove(hosts, oldIndex, newIndex);
      
      // Update order_index for each host
      const reorderedHosts = newHosts.map((host, index) => ({
        ...host,
        order_index: index,
      }));
      
      onReorder(reorderedHosts);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
          <SortableContext
            items={hosts.map(host => host.id)}
            strategy={verticalListSortingStrategy}
          >
            {hosts.map((host) => (
              <SortableItem
                key={host.id}
                host={host}
                isEditing={isEditing}
                editForm={editForm}
                setEditForm={setEditForm}
                onEdit={onEdit}
                onSave={onSave}
                onDelete={onDelete}
                onImageSelect={onImageSelect}
                uploading={uploading}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}
