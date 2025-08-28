
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

const LoyaltyCard = ({ user }: LoyaltyCardProps) => {
  const [loyaltyData, setLoyaltyData] = useState<{
    points: number;
    totalEarned: number;
    level: string;
    nextReward: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      const level = getLoyaltyLevel(data.total_earned);
      const nextReward = getNextRewardThreshold(data.total_earned);
      
      setLoyaltyData({
        points: data.points,
        totalEarned: data.total_earned,
        level: level.name,
        nextReward
      });
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
