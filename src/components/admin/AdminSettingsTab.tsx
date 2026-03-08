import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';

type Setting = {
  id: string;
  key: string;
  value: string;
  description: string | null;
};

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('store_settings').select('*').order('key');
    setSettings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (key: string, value: string) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  };

  const saveAll = async () => {
    setSaving(true);
    const entries = Object.entries(edits);
    let errors = 0;
    for (const [key, value] of entries) {
      const { error } = await (supabase as any)
        .from('store_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) errors++;
    }
    setSaving(false);
    if (errors) {
      toast.error(`${errors} setting(s) failed to save`);
    } else {
      toast.success('Settings saved successfully');
      setEdits({});
      fetchSettings();
    }
  };

  const hasChanges = Object.keys(edits).length > 0;

  const settingLabels: Record<string, { label: string; type: string }> = {
    delivery_fee: { label: 'Delivery Fee (TSh)', type: 'number' },
    min_order_amount: { label: 'Minimum Order Amount (TSh)', type: 'number' },
    operating_hours_open: { label: 'Opening Time', type: 'time' },
    operating_hours_close: { label: 'Closing Time', type: 'time' },
    currency: { label: 'Currency Symbol', type: 'text' },
    tax_rate: { label: 'Tax Rate (%)', type: 'number' },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" /> Store Settings
          </CardTitle>
          <CardDescription>Configure store-wide settings and defaults</CardDescription>
        </div>
        {hasChanges && (
          <Button onClick={saveAll} disabled={saving} className="gap-1.5">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading settings...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.map(setting => {
              const meta = settingLabels[setting.key] || { label: setting.key, type: 'text' };
              const currentValue = edits[setting.key] ?? setting.value;
              const isEdited = edits[setting.key] !== undefined;

              return (
                <div key={setting.id} className={`space-y-2 p-4 rounded-lg border ${isEdited ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                  <Label className="text-sm font-medium">{meta.label}</Label>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  )}
                  <Input
                    type={meta.type}
                    value={currentValue}
                    onChange={e => handleChange(setting.key, e.target.value)}
                    className="h-9"
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
