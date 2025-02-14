
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Host = {
  id: string;
  name: string;
  title: string;
  image_url: string;
  order_index: number;
};

export const Hosts = () => {
  const { data: hosts = [] } = useQuery({
    queryKey: ['hosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      
      // Custom sort to place Lanza between Pirozzolo and Fossella
      return data?.sort((a, b) => {
        // Helper function to determine if a name contains a specific string
        const hasName = (fullName: string, searchName: string) => 
          fullName.toLowerCase().includes(searchName.toLowerCase());

        // Specific ordering logic
        if (hasName(a.name, 'Pirozzolo')) return -1;
        if (hasName(b.name, 'Pirozzolo')) return 1;
        if (hasName(a.name, 'Lanza') && hasName(b.name, 'Fossella')) return -1;
        if (hasName(b.name, 'Lanza') && hasName(a.name, 'Fossella')) return 1;
        
        // Use order_index for any other cases
        return a.order_index - b.order_index;
      }) as Host[];
    }
  });

  return (
    <div className="flex justify-center gap-6 px-4 max-w-7xl mx-auto">
      {hosts.map((host, index) => (
        <Card key={host.id} className="glass p-4 flex flex-col items-center animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <img
              src={host.image_url}
              alt={host.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-secondary font-bold text-lg">{host.title}</h3>
          <p className="text-white text-center">{host.name}</p>
        </Card>
      ))}
    </div>
  );
};
