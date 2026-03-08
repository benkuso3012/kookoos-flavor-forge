import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShoppingBag, UtensilsCrossed, MapPin, BarChart3, Bell, 
  ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AdminOnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: 'Welcome to Kookoos Admin',
    description: 'This is your command center for managing the restaurant. Let\'s take a quick tour of the key features available to you.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: ShoppingBag,
    title: 'Order Management',
    description: 'Track incoming orders in real-time. Update order statuses from pending → preparing → ready → delivered. New orders trigger instant notifications.',
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/10',
    tab: 'orders',
  },
  {
    icon: UtensilsCrossed,
    title: 'Menu Management',
    description: 'Add, edit, and manage your menu items. Toggle availability on/off, mark items as featured, set prices, prep times, and dietary tags.',
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    tab: 'menu',
  },
  {
    icon: MapPin,
    title: 'Store Locations',
    description: 'Manage your restaurant locations. Add new stores, update hours, toggle active status, and mark flagship locations.',
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    tab: 'stores',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'View 7-day revenue trends, order breakdowns by status, and recent activity. Use data to make smarter decisions for your business.',
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    tab: 'overview',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Orders appear instantly via Supabase real-time subscriptions. You\'ll get toast alerts whenever a new order comes in — no refreshing needed.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: CheckCircle2,
    title: 'You\'re All Set!',
    description: 'You now know the essentials. Start by checking your orders tab or adding menu items. You can always revisit this tour from the settings.',
    color: 'text-green-600',
    bg: 'bg-green-500/10',
  },
];

const STORAGE_KEY = 'kookoos_admin_onboarded';

export default function AdminOnboarding({ onComplete }: AdminOnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete();
  };

  const next = () => {
    if (current === steps.length - 1) {
      finish();
    } else {
      setCurrent(c => c + 1);
    }
  };

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const skip = () => finish();

  if (!visible) return null;

  const step = steps[current];
  const progress = ((current + 1) / steps.length) * 100;
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg"
        >
          <Card className="border-border shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <div className="px-6 pt-5 pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Step {current + 1} of {steps.length}
                </span>
                <Button variant="ghost" size="sm" onClick={skip} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5 mr-1" /> Skip tour
                </Button>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <CardContent className="p-6 pt-5">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center`}
                >
                  <StepIcon className={`w-8 h-8 ${step.color}`} />
                </motion.div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">{step.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Tab hint */}
              {step.tab && (
                <div className="flex justify-center mb-5">
                  <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                    📍 Find this in the <strong className="text-foreground capitalize">{step.tab}</strong> tab
                  </span>
                </div>
              )}

              {/* Step dots */}
              <div className="flex justify-center gap-1.5 mb-5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current ? 'bg-primary w-6' : i < current ? 'bg-primary/40' : 'bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prev}
                  disabled={current === 0}
                  className="gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={next} size="sm" className="gap-1">
                  {current === steps.length - 1 ? (
                    <>Get Started <Sparkles className="w-4 h-4" /></>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Call this to reset onboarding so it shows again */
export function resetAdminOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
}
