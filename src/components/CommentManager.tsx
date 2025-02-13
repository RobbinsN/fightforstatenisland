
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Comment = {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  comment: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'archived';
  response: string | null;
  reviewed_at: string | null;
  rsvp_id: string | null;
};

export const CommentManager = () => {
  const queryClient = useQueryClient();
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Comment[];
    }
  });

  const handleStatusUpdate = async (id: string, status: 'pending' | 'reviewed' | 'archived') => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          status,
          reviewed_at: status === 'reviewed' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success("Status updated successfully");
    } catch (error: any) {
      console.error('Status update error:', error);
      toast.error(error.message);
    }
  };

  const handleResponseSubmit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          response,
          status: 'reviewed',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success("Response submitted successfully");
      setExpandedComment(null);
      setResponse("");
    } catch (error: any) {
      console.error('Response submission error:', error);
      toast.error(error.message);
    }
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

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p>Loading comments...</p>
      ) : comments && comments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell>{`${comment.first_name} ${comment.last_name}`}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p>{comment.phone}</p>
                    <p className="text-sm text-muted-foreground">{comment.address}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">{comment.comment}</p>
                    {comment.response && (
                      <div className="mt-2 p-2 bg-secondary/10 rounded-md">
                        <p className="text-sm font-semibold">Response:</p>
                        <p className="text-sm">{comment.response}</p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={comment.status}
                    onValueChange={(value: 'pending' | 'reviewed' | 'archived') => 
                      handleStatusUpdate(comment.id, value)
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue>
                        <Badge
                          variant={
                            comment.status === 'reviewed' ? 'default' :
                            comment.status === 'archived' ? 'secondary' : 'outline'
                          }
                        >
                          {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(comment.created_at)}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {expandedComment === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Type your response..."
                          className="min-h-[100px]"
                        />
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleResponseSubmit(comment.id)}
                          >
                            Submit Response
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setExpandedComment(null);
                              setResponse("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setExpandedComment(comment.id);
                          setResponse(comment.response || "");
                        }}
                      >
                        {comment.response ? "Edit Response" : "Respond"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground">No comments submitted yet.</p>
      )}
    </div>
  );
};
