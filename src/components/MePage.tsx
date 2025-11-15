import { useState } from 'react';
import { UserProfile, WeightEntry } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusIcon, PencilIcon, Trash2Icon, LanguageIcon } from './Icons';
import { CustomDialog } from './CustomDialog';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';

interface MePageProps {
  profile: UserProfile;
  weightEntries: WeightEntry[];
  onUpdateProfile: (profile: UserProfile) => void;
  onAddWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  onUpdateWeightEntry: (id: string, entry: Omit<WeightEntry, 'id'>) => void;
  onDeleteWeightEntry: (id: string) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export function MePage({
  profile,
  weightEntries,
  onUpdateProfile,
  onAddWeightEntry,
  onUpdateWeightEntry,
  onDeleteWeightEntry,
  language,
  onToggleLanguage,
}: MePageProps) {
  const { t } = useTranslation(language);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightValue, setWeightValue] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  
  const [proteinTarget, setProteinTarget] = useState(profile.proteinTarget.toString());
  const [fatTarget, setFatTarget] = useState(profile.fatTarget.toString());
  const [carbsTarget, setCarbsTarget] = useState(profile.carbsTarget.toString());

  // Auto-calculate calories from macros: protein*4 + fat*9 + carbs*4
  const calculatedCalories = Math.round(
    (parseFloat(proteinTarget) || 0) * 4 +
    (parseFloat(fatTarget) || 0) * 9 +
    (parseFloat(carbsTarget) || 0) * 4
  );

  const handleSaveTargets = () => {
    onUpdateProfile({
      proteinTarget: parseFloat(proteinTarget) || 0,
      fatTarget: parseFloat(fatTarget) || 0,
      carbsTarget: parseFloat(carbsTarget) || 0,
      caloriesTarget: calculatedCalories,
    });
  };

  const handleAddWeight = () => {
    setEditingWeight(null);
    setWeightDate(new Date().toISOString().split('T')[0]);
    setWeightValue('');
    setIsStarting(false);
    setShowWeightDialog(true);
  };

  const handleEditWeight = (entry: WeightEntry) => {
    setEditingWeight(entry);
    setWeightDate(entry.date);
    setWeightValue(entry.weight.toString());
    setIsStarting(entry.isStarting || false);
    setShowWeightDialog(true);
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = {
      date: weightDate,
      weight: parseFloat(weightValue),
      isStarting,
    };

    if (editingWeight) {
      onUpdateWeightEntry(editingWeight.id, entry);
    } else {
      onAddWeightEntry(entry);
    }

    setShowWeightDialog(false);
  };

  const sortedEntries = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
  const startingEntry = weightEntries.find(e => e.isStarting);
  const latestEntry = sortedEntries[0];
  const weightChange = startingEntry && latestEntry 
    ? latestEntry.weight - startingEntry.weight 
    : 0;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Language Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onToggleLanguage}>
          <LanguageIcon className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Русский' : 'English'}
        </Button>
      </div>

      {/* Daily Targets */}
      <Card className="p-4">
        <h2 className="text-gray-900 mb-4">{t('dailyTargets')}</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">{t('protein')} (г)</label>
              <Input
                type="number"
                step="0.1"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(e.target.value)}
                onBlur={handleSaveTargets}
              />
            </div>
            <div>
              <label className="text-sm block mb-1">{t('fat')} (г)</label>
              <Input
                type="number"
                step="0.1"
                value={fatTarget}
                onChange={(e) => setFatTarget(e.target.value)}
                onBlur={handleSaveTargets}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">{t('carbs')} (г)</label>
              <Input
                type="number"
                step="0.1"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(e.target.value)}
                onBlur={handleSaveTargets}
              />
            </div>
            <div>
              <label className="text-sm block mb-1">{t('calories')}</label>
              <Input
                type="number"
                value={calculatedCalories}
                readOnly
                className="bg-gray-100"
                title={t('autoCalculated')}
              />
              <div className="text-xs text-gray-500 mt-1">{t('autoCalculated')}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Weight Statistics */}
      {(startingEntry || latestEntry) && (
        <Card className="p-4">
          <h2 className="text-gray-900 mb-4">{t('weightChange')}</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            {startingEntry && (
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-xs text-gray-600">{t('startingWeight')}</div>
                <div className="text-blue-600">{startingEntry.weight} {t('kg')}</div>
              </div>
            )}
            {latestEntry && (
              <div className="p-2 bg-green-50 rounded">
                <div className="text-xs text-gray-600">{t('currentWeight')}</div>
                <div className="text-green-600">{latestEntry.weight} {t('kg')}</div>
              </div>
            )}
            {startingEntry && latestEntry && (
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-xs text-gray-600">{t('weightChange')}</div>
                <div className={weightChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} {t('kg')}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Weight Entries */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-900">{t('weighIns')}</h2>
          <Button size="sm" onClick={handleAddWeight}>
            <PlusIcon className="h-4 w-4 mr-1" />
            {t('add')}
          </Button>
        </div>

        {sortedEntries.length > 0 ? (
          <div className="space-y-2">
            {sortedEntries.map((entry, index) => {
              // Calculate change from previous entry
              const previousEntry = sortedEntries[index + 1]; // Next in sorted array is older
              const weightDiff = previousEntry ? entry.weight - previousEntry.weight : 0;
              
              return (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="text-gray-900">
                      {entry.weight} {t('kg')}
                      {entry.isStarting && (
                        <span className="ml-2 text-xs text-blue-600">({t('startingWeight')})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{entry.date}</div>
                    {previousEntry && (
                      <div className={`text-xs mt-1 ${weightDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t('change')}: {weightDiff >= 0 ? '+' : ''}{weightDiff.toFixed(1)} {t('kg')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditWeight(entry)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteWeightEntry(entry.id)}
                    >
                      <Trash2Icon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{t('noWeighIns')}</p>
          </div>
        )}
      </Card>

      {/* Weight Dialog */}
      <CustomDialog
        open={showWeightDialog}
        onClose={() => setShowWeightDialog(false)}
        title={editingWeight ? t('editWeighIn') : t('addWeighIn')}
      >
        <form onSubmit={handleSaveWeight} className="space-y-4">
          <div>
            <label className="text-sm block mb-1">{t('date')}</label>
            <Input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">{t('weight')} ({t('kg')})</label>
            <Input
              type="number"
              step="0.1"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isStarting"
              checked={isStarting}
              onChange={(e) => setIsStarting(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="isStarting" className="text-sm">
              {t('setStartingWeight')}
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowWeightDialog(false)} className="flex-1">
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1">
              {editingWeight ? t('update') : t('add')}
            </Button>
          </div>
        </form>
      </CustomDialog>
    </div>
  );
}
