import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuPreview from "@/components/MenuPreview";
import Locations from "@/components/Locations";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <MenuPreview />
        <Locations />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
