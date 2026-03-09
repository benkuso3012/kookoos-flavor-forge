import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, Phone, MapPin, LogOut, ShoppingBag, Heart, Star, Award } from "lucide-react";

interface ProfileData {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      setUser(user);
      fetchProfile(user.id);
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await (supabase as any).from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const updatedProfile = {
      id: user.id,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    };
    try {
      const { error } = await (supabase as any).from("profiles").upsert(updatedProfile, { onConflict: "id" });
      if (error) throw error;
      setProfile({ ...profile!, ...updatedProfile, updated_at: new Date().toISOString() });
      toast({ title: "Profile Updated! ✅", description: "Your changes have been saved" });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({ title: "Signed Out", description: "See you next time! 👋" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 flex items-center justify-center min-h-[50vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-heading text-3xl font-bold">{profile?.full_name || "Your Profile"}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {/* Loyalty Points Card */}
            <Card className="border-0 shadow-card mb-6 bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Loyalty Points</p>
                  <p className="font-heading text-4xl font-bold">{profile?.loyalty_points || 0}</p>
                  <p className="text-xs opacity-70 mt-1">Earn 1 point per TSh 100 spent</p>
                </div>
                <Award className="h-16 w-16 opacity-30" />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="border-0 shadow-card cursor-pointer hover:shadow-glow transition-shadow" onClick={() => navigate("/orders")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-sm">My Orders</p>
                    <p className="text-xs text-muted-foreground">Track & reorder</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card cursor-pointer hover:shadow-glow transition-shadow" onClick={() => navigate("/favorites")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-sm">Favorites</p>
                    <p className="text-xs text-muted-foreground">Saved items</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card cursor-pointer hover:shadow-glow transition-shadow" onClick={() => navigate("/menu")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Star className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-sm">Browse Menu</p>
                    <p className="text-xs text-muted-foreground">Order now</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="font-heading">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} placeholder="Your full name" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ""} placeholder="+255 xxx xxx xxx" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea id="address" name="address" defaultValue={profile?.address || ""} placeholder="Your delivery address" className="pl-10" rows={3} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 font-bold" disabled={saving}>
                      {saving ? "Saving..." : "Update Profile"}
                    </Button>
                    <Button type="button" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "recently"}
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
