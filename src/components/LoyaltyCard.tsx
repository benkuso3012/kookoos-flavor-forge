
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

interface LoyaltyCardProps {
  user: User | null;
}

interface LoyaltyData {
  points: number;
  totalEarned: number;
  level: string;
  nextReward: number;
}

const LoyaltyCard = ({ user }: LoyaltyCardProps) => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('loyalty_points' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const level = getLoyaltyLevel(data.total_earned || 0);
        const nextReward = getNextRewardThreshold(data.total_earned || 0);
        
        setLoyaltyData({
          points: data.points || 0,
          totalEarned: data.total_earned || 0,
          level: level.name,
          nextReward
        });
      } else {
        // Create initial loyalty record
        const { data: newData } = await supabase
          .from('loyalty_points' as any)
          .insert({
            user_id: user.id,
            points: 0,
            total_earned: 0
          })
          .select()
          .single();

        if (newData) {
          setLoyaltyData({
            points: 0,
            totalEarned: 0,
            level: "Bronze",
            nextReward: 1000
          });
        }
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const getLoyaltyLevel = (totalEarned: number) => {
    if (totalEarned >= 5000) return { name: "Diamond", icon: Crown, color: "text-purple-500" };
    if (totalEarned >= 2500) return { name: "Gold", icon: Star, color: "text-yellow-500" };
    if (totalEarned >= 1000) return { name: "Silver", icon: Star, color: "text-gray-500" };
    return { name: "Bronze", icon: Gift, color: "text-orange-500" };
  };

  const getNextRewardThreshold = (totalEarned: number) => {
    if (totalEarned < 1000) return 1000;
    if (totalEarned < 2500) return 2500;
    if (totalEarned < 5000) return 5000;
    return 10000;
  };

  if (!user || !loyaltyData) return null;

  const level = getLoyaltyLevel(loyaltyData.totalEarned);
  const progress = (loyaltyData.totalEarned / loyaltyData.nextReward) * 100;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <level.icon className={`h-5 w-5 ${level.color}`} />
          {level.name} Member
          <Badge variant="secondary">{loyaltyData.points} points</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next level</span>
            <span>{loyaltyData.totalEarned} / {loyaltyData.nextReward}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Earn 1 point for every $1 spent • Redeem points for rewards
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoyaltyCard;
