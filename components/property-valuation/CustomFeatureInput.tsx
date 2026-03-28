'use client';

import { useState } from 'react';
import { usePropertyValuation, CustomFeature } from './PropertyValuationContext';
import { RoomType, ROOM_TYPES } from '@/types/property-valuation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Plus, X, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';

export function CustomFeatureInput() {
  const { customFeatures, addCustomFeature, removeCustomFeature } = usePropertyValuation();
  const t = useTranslations('valuation.customFeatures');
  const tRooms = useTranslations('valuation.rooms');

  const [name, setName] = useState('');
  const [room, setRoom] = useState<RoomType>('Extras');
  const [weight, setWeight] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFeature = async () => {
    if (!name.trim()) {
      toast.error(t('enterFeatureName'));
      return;
    }

    // Add to local context (visible in report)
    addCustomFeature({ name: name.trim(), room, weight });

    // Submit to backend for admin review
    try {
      setIsSubmitting(true);
      await fetch('/api/custom-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          room,
          weight,
        }),
      });
      toast.success(t('featureAddedAndSubmitted'));
    } catch (error) {
      // Still added locally, just note that admin submission failed
      toast.success(t('featureAddedLocal'));
    } finally {
      setIsSubmitting(false);
    }

    // Reset form
    setName('');
    setWeight(3);
  };

  return (
    <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
          <Sparkles className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <p className="text-sm text-amber-600">{t('description')}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Label htmlFor="feature-name" className="text-sm text-gray-600">
              {t('featureName')}
            </Label>
            <Input
              id="feature-name"
              placeholder={t('featureNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="feature-room" className="text-sm text-gray-600">
              {t('category')}
            </Label>
            <Select value={room} onValueChange={(v) => setRoom(v as RoomType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {tRooms(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feature-weight" className="text-sm text-gray-600">
              {t('valueImpact')}
            </Label>
            <Select value={weight.toString()} onValueChange={(v) => setWeight(parseInt(v))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    {w} - {w === 1 ? t('basic') : w === 5 ? t('premium') : t('standard')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleAddFeature}
          disabled={isSubmitting || !name.trim()}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addFeature')}
          <Send className="h-4 w-4 ml-2" />
        </Button>

        {/* Added Custom Features */}
        {customFeatures.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm text-gray-600">{t('addedFeatures')}</Label>
            <div className="flex flex-wrap gap-2">
              {customFeatures.map((feature) => (
                <Badge
                  key={feature.id}
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 pl-3 pr-1 py-1.5 flex items-center gap-2"
                >
                  <span>{feature.name}</span>
                  <span className="text-amber-500 text-xs">({tRooms(feature.room)})</span>
                  <button
                    onClick={() => removeCustomFeature(feature.id)}
                    className="ml-1 p-0.5 hover:bg-amber-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
