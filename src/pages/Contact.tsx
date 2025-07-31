import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  const locations = [
    {
      name: "Bahari Beach",
      address: "Beach Road, Bahari Beach, Dar es Salaam",
      phone: "+255 123 456 789",
      hours: "10:00 AM - 11:00 PM"
    },
    {
      name: "Tegeta",
      address: "Main Road, Tegeta, Dar es Salaam",
      phone: "+255 123 456 790",
      hours: "10:00 AM - 11:00 PM"
    },
    {
      name: "Sinza",
      address: "Sinza Plaza, Sinza, Dar es Salaam",
      phone: "+255 123 456 791",
      hours: "10:00 AM - 11:00 PM"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              GET IN TOUCH
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              We'd Love to <span className="text-primary">Hear From You</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hello? Drop us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+255 123 456 789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 font-bold"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
                  Get in Touch
                </h2>

                <div className="space-y-8">
                  {/* Quick Contact */}
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-6">
                      <h3 className="font-heading text-xl font-bold mb-4">Quick Contact</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Main Hotline</div>
                            <div className="text-muted-foreground">+255 123 456 789</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Email Us</div>
                            <div className="text-muted-foreground">hello@kookoos.co.tz</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Clock className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Operating Hours</div>
                            <div className="text-muted-foreground">10:00 AM - 11:00 PM Daily</div>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-6 bg-green-600 hover:bg-green-700"
                        onClick={() => window.open('https://wa.me/255123456789', '_blank')}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        WhatsApp Us
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Emergency Contact */}
                  <Card className="border-0 shadow-card bg-primary/5">
                    <CardContent className="p-6">
                      <h3 className="font-heading text-xl font-bold mb-4 text-primary">Need Help with Your Order?</h3>
                      <p className="text-muted-foreground mb-4">
                        Having issues with a recent order or need immediate assistance? Call our customer service line.
                      </p>
                      <Button 
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Customer Service: +255 123 456 788
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Visit Our <span className="text-primary">Locations</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find the nearest Kookoos location and come experience our bold flavors in person.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {locations.map((location, index) => (
                <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-0 shadow-card">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    
                    <h3 className="font-heading text-xl font-bold mb-4">{location.name}</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium">Address</div>
                        <div className="text-muted-foreground">{location.address}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-muted-foreground">{location.phone}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium">Hours</div>
                        <div className="text-muted-foreground">{location.hours}</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        const address = encodeURIComponent(location.address);
                        window.open(`https://maps.google.com/?q=${address}`, '_blank');
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;