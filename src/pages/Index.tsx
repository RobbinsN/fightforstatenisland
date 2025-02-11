
import { RSVPForm } from "@/components/RSVPForm";
import { Hosts } from "@/components/Hosts";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
        <div className="space-y-2">
          <p className="text-2xl font-bold">Thursday, March 27, 2025</p>
          <p className="text-xl">7:00 PM</p>
          <p className="text-xl">Gold Star Post - 17 Cannon Ave</p>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="container mx-auto animate-fadeIn" style={{ animationDelay: "200ms" }}>
        <h2 className="text-3xl font-bold text-center mb-8">RSVP for In-Person Attendance</h2>
        <RSVPForm />
      </section>

      {/* Livestream Section */}
      <section className="container mx-auto text-center space-y-6 animate-fadeIn" style={{ animationDelay: "400ms" }}>
        <h2 className="text-3xl font-bold mb-4">Watch Livestream</h2>
        <div className="glass p-8 max-w-4xl mx-auto rounded-lg">
          <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center mb-4">
            <Youtube className="w-16 h-16 text-secondary" />
          </div>
          <p className="text-lg mb-4">
            The event will be streamed live on YouTube and Facebook
          </p>
          <Button 
            className="bg-secondary text-primary hover:bg-secondary/90"
            onClick={() => window.open("https://TravisTalks.com", "_blank")}
          >
            Visit TravisTalks.com
          </Button>
        </div>
      </section>

      {/* Hosts Section */}
      <section className="container mx-auto animate-fadeIn" style={{ animationDelay: "600ms" }}>
        <h2 className="text-3xl font-bold text-center mb-8">Hosted By</h2>
        <Hosts />
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
