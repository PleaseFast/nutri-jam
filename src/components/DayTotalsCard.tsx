import { DayTotals, UserProfile, Language } from '../types';
import { Card } from './ui/card';
import { useTranslation } from '../utils/translations';

interface DayTotalsCardProps {
  totals: DayTotals;
  profile?: UserProfile;
  language: Language;
}

export function DayTotalsCard({ totals, profile, language }: DayTotalsCardProps) {
  const { t } = useTranslation(language);
  
  const getPercentage = (value: number, target: number) => {
    if (!target) return 0;
    return Math.round((value / target) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-gray-600';
  };

  const caloriesPercentage = profile?.caloriesTarget ? getPercentage(totals.calories, profile.caloriesTarget) : 0;
  const proteinPercentage = profile?.proteinTarget ? getPercentage(totals.protein, profile.proteinTarget) : 0;
  const fatPercentage = profile?.fatTarget ? getPercentage(totals.fat, profile.fatTarget) : 0;
  const carbsPercentage = profile?.carbsTarget ? getPercentage(totals.carbs, profile.carbsTarget) : 0;

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="text-center mb-3">
        <div className="text-3xl text-blue-600">{totals.calories}</div>
        <div className="text-sm text-gray-600">
          {t('todayTotal')}
          {profile && profile.caloriesTarget > 0 && (
            <div className={`text-lg mt-1 ${getProgressColor(caloriesPercentage)}`}>
              {caloriesPercentage}%
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xl text-green-600">{totals.protein.toFixed(1)}g</div>
          <div className="text-xs text-gray-600">{t('protein')}</div>
          {profile && profile.proteinTarget > 0 && (
            <div className={`text-sm ${getProgressColor(proteinPercentage)}`}>
              {proteinPercentage}%
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-xl text-orange-600">{totals.fat.toFixed(1)}g</div>
          <div className="text-xs text-gray-600">{t('fat')}</div>
          {profile && profile.fatTarget > 0 && (
            <div className={`text-sm ${getProgressColor(fatPercentage)}`}>
              {fatPercentage}%
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-xl text-purple-600">{totals.carbs.toFixed(1)}g</div>
          <div className="text-xs text-gray-600">{t('carbs')}</div>
          {profile && profile.carbsTarget > 0 && (
            <div className={`text-sm ${getProgressColor(carbsPercentage)}`}>
              {carbsPercentage}%
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
