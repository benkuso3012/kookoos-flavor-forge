import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Award, Heart, Flame } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: <Flame className="w-8 h-8 text-primary" />,
      title: "Bold Flavors",
      description: "Every dish is crafted with authentic Tanzanian spices and bold street food flavors that tell our story."
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Community First",
      description: "We're more than a restaurant - we're part of the community, bringing people together over great food."
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Quality Promise",
      description: "Fresh ingredients, careful preparation, and consistent quality in every bite - that's our commitment."
    }
  ];

  const stats = [
    { number: "2019", label: "Founded" },
    { number: "3", label: "Locations" },
    { number: "10K+", label: "Happy Customers" },
    { number: "50+", label: "Menu Items" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              OUR STORY
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Bold Food, <span className="text-primary">Bolder Spirit</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Born on the vibrant streets of Dar es Salaam, Kookoos represents the bold spirit of Tanzanian street food culture. 
              We're not just about serving meals - we're about celebrating flavor, community, and the joy that comes from sharing great food.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-heading text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                What Drives <span className="text-primary">Us</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our values are baked into everything we do - from the spices we choose to the communities we serve.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-0 shadow-card text-center">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        {value.icon}
                      </div>
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our <span className="text-primary">Journey</span>
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold mb-2">2019 - The Beginning</h3>
                    <p className="text-muted-foreground">
                      Started as a small street food stall in Bahari Beach, serving bold flavors to the local community.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold mb-2">2021 - Expansion</h3>
                    <p className="text-muted-foreground">
                      Opened our second location in Tegeta, bringing our signature taste to more neighborhoods.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold mb-2">2023 - Growing Strong</h3>
                    <p className="text-muted-foreground">
                      Launched our third location in Sinza and introduced our signature packaging that everyone loves.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold mb-2">2024 - Going Digital</h3>
                    <p className="text-muted-foreground">
                      Launching our online platform to serve you better and bring Kookoos to your doorstep.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to <span className="text-primary">Join the Family?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Come experience the bold flavors and warm community that makes Kookoos special.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-primary text-white font-heading font-bold text-lg px-12 py-6 shadow-glow hover:shadow-xl transition-all"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find a Location
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="font-heading font-bold text-lg px-12 py-6 border-primary text-primary hover:bg-primary hover:text-white transition-all"
              >
                <Clock className="w-5 h-5 mr-2" />
                Order Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;