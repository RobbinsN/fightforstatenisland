import { RSVPForm } from "@/components/RSVPForm";
import { Hosts } from "@/components/Hosts";
import { Button } from "@/components/ui/button";
import { Youtube, MapPin, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const [countdown, setCountdown] = useState<string>("");

  const { data: mapApiKey } = useQuery({
    queryKey: ['google-maps-api-key'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'GOOGLE_MAPS_API_KEY')
        .maybeSingle();
      
      if (error) throw error;
      return data?.value;
    }
  });

  useEffect(() => {
    const targetDate = new Date('2025-03-27T19:00:00-04:00'); // 7 PM EST on March 27, 2025

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference < 0) {
        setCountdown("The event has started!");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col gap-16 py-12">
      {/* Hero Section */}
      <section className="container mx-auto text-center space-y-6 animate-fadeIn">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Travis Community{" "}
          <span className="text-secondary">Conversation</span>
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
          Join Your Elected Officials For A Conversation About The Proposed Battery Storage Site & Travis Ave Construction projects.
        </p>
      </section>

      {/* Hosts Section - Moved up */}
      <section className="container mx-auto animate-fadeIn">
        <h2 className="text-3xl font-bold text-center mb-8">Hosted By</h2>
        <Hosts />
      </section>

      {/* Event Details Section with Map */}
      <section className="container mx-auto animate-fadeIn" style={{ animationDelay: "200ms" }}>
        <div className="glass p-8 rounded-lg max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Map */}
            <div className="h-[300px] rounded-lg overflow-hidden">
              {mapApiKey ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=17+Cannon+Avenue,Staten+Island,NY+10314`}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/20">
                  <MapPin className="w-8 h-8 text-secondary animate-pulse" />
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-secondary" />
                  <p className="text-2xl font-bold">Thursday, March 27, 2025</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-secondary" />
                  <p className="text-xl">7:00 PM</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="text-xl font-bold">Gold Star Post</p>
                    <p className="text-lg">17 Cannon Avenue</p>
                    <p className="text-lg">Staten Island, NY 10314</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="container mx-auto animate-fadeIn" style={{ animationDelay: "400ms" }}>
        <h2 className="text-3xl font-bold text-center mb-8">RSVP for In-Person Attendance</h2>
        <RSVPForm />
      </section>

      {/* Livestream Section */}
      <section className="container mx-auto text-center space-y-6 animate-fadeIn" style={{ animationDelay: "600ms" }}>
        <h2 className="text-3xl font-bold mb-4">Watch Livestream</h2>
        <div className="glass p-8 max-w-4xl mx-auto rounded-lg">
          <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center mb-4">
            <Youtube className="w-16 h-16 text-secondary" />
          </div>
          <p className="text-lg mb-4">
            Return here on March 27th at 7:00 PM EST to watch the livestream on YouTube and Facebook
          </p>
          <div className="text-2xl font-bold text-secondary">
            Time until livestream: {countdown}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto text-center mt-8">
        <div className="space-y-2 text-white/60 mb-4">
          <p>This conversation is open to residents of Travis only.</p>
          <p>Off topic questions may not be addressed publicly.</p>
          <p>SEATING IS LIMITED | RSVP REQUIRED</p>
        </div>
        <Link 
          to="/auth" 
          className="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          Admin Access
        </Link>
      </footer>
    </div>
  );
};

export default Index;
