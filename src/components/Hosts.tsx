
import { Card } from "@/components/ui/card";

const hosts = [
  {
    name: "Sam Pirozzolo",
    title: "ASSEMBLYMAN",
    image: "/lovable-uploads/ee43ec09-a906-4f59-9001-9d242ba15767.png",
  },
  {
    name: "Vito Fossella",
    title: "BOROUGH PRESIDENT",
    image: "/lovable-uploads/ee43ec09-a906-4f59-9001-9d242ba15767.png",
  },
  {
    name: "Andrew Lanza",
    title: "SENATOR",
    image: "/lovable-uploads/ee43ec09-a906-4f59-9001-9d242ba15767.png",
  },
  {
    name: "David Carr",
    title: "COUNCILMAN",
    image: "/lovable-uploads/ee43ec09-a906-4f59-9001-9d242ba15767.png",
  },
  {
    name: "Mike Reilly",
    title: "ASSEMBLYMAN",
    image: "/lovable-uploads/ee43ec09-a906-4f59-9001-9d242ba15767.png",
  },
];

export const Hosts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 px-4 max-w-7xl mx-auto">
      {hosts.map((host, index) => (
        <Card key={index} className="glass p-4 flex flex-col items-center animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <img
              src={host.image}
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
