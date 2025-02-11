
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
      return data as Host[];
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 px-4 max-w-7xl mx-auto">
      {hosts.map((host, index) => (
        <Card key={host.id} className="glass p-4 flex flex-col items-center animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <img
              src={host.image_url}
              alt={host.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-secondary font-bold">{host.title}</h3>
          <p className="text-white">{host.name}</p>
        </Card>
      ))}
    </div>
  );
};
