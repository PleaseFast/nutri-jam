import { useMemo, useState } from 'react';
import { MealNote, UserProfile } from '../types';
import { Card } from './ui/card';
import { formatDate } from '../utils/calculations';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts@2.15.2';

interface SummaryPageProps {
  mealNotes: MealNote[];
  profile: UserProfile;
  language: Language;
}

interface DayData {
  day: string;
  dayShort: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

export function SummaryPage({ mealNotes, profile, language }: SummaryPageProps) {
  const { t } = useTranslation(language);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  const weeklyData = useMemo(() => {
    const weeks: DayData[][] = [];
    const today = new Date();
    
    // Generate data for last 8 weeks
    for (let weekOffset = 0; weekOffset < 8; weekOffset++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1 - (weekOffset * 7)); // Monday
      weekStart.setHours(0, 0, 0, 0);
      
      const weekData: DayData[] = [];
      
      // Get data for each day of the week (Mon-Sun)
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + dayOffset);
        const dateStr = formatDate(currentDay);
        
        // Get all notes for this day
        const dayNotes = mealNotes.filter(note => note.date === dateStr);
        
        // Calculate totals
        const totals = dayNotes.reduce(
          (acc, note) => ({
            protein: acc.protein + note.protein,
            fat: acc.fat + note.fat,
            carbs: acc.carbs + note.carbs,
            calories: acc.calories + note.calories,
          }),
          { protein: 0, fat: 0, carbs: 0, calories: 0 }
        );
        
        // Get weekday name
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayName = dayNames[currentDay.getDay()];
        
        weekData.push({
          day: dateStr,
          dayShort: t(dayName as any),
          protein: totals.protein,
          fat: totals.fat,
          carbs: totals.carbs,
          calories: totals.calories,
        });
      }
      
      weeks.push(weekData);
    }
    
    return weeks;
  }, [mealNotes, t]);

  const currentWeekData = weeklyData[selectedWeekOffset] || [];
  
  // Calculate weekly averages
  const weeklyAverages = useMemo(() => {
    if (currentWeekData.length === 0) {
      return { protein: 0, fat: 0, carbs: 0, calories: 0 };
    }
    
    const totals = currentWeekData.reduce(
      (acc, day) => ({
        protein: acc.protein + day.protein,
        fat: acc.fat + day.fat,
        carbs: acc.carbs + day.carbs,
        calories: acc.calories + day.calories,
      }),
      { protein: 0, fat: 0, carbs: 0, calories: 0 }
    );
    
    const daysCount = currentWeekData.length;
    
    return {
      protein: totals.protein / daysCount,
      fat: totals.fat / daysCount,
      carbs: totals.carbs / daysCount,
      calories: totals.calories / daysCount,
    };
  }, [currentWeekData]);

  const startDate = currentWeekData[0]?.day || '';
  const endDate = currentWeekData[6]?.day || '';

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-20">
      <h1 className="text-gray-900">{t('weeklyStats')}</h1>

      {/* Week selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weeklyData.map((week, index) => (
          <button
            key={week[0]?.day || index}
            onClick={() => setSelectedWeekOffset(index)}
            className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
              index === selectedWeekOffset
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {week[0]?.day.slice(5) || ''}
          </button>
        ))}
      </div>

      {currentWeekData.length > 0 && (
        <>
          {/* Week header */}
          <Card className="p-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">{t('weekOf')}</div>
              <div className="text-gray-900">
                {startDate} - {endDate}
              </div>
            </div>
          </Card>

          {/* Protein Chart */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-gray-900">{t('protein')} (g)</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600">{language === 'ru' ? 'Среднее' : 'Average'}</div>
                <div className="text-green-600">{weeklyAverages.protein.toFixed(1)}g</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayShort" />
                <YAxis />
                <Tooltip />
                {profile.proteinTarget > 0 && (
                  <ReferenceLine 
                    y={profile.proteinTarget} 
                    stroke="#22c55e" 
                    strokeDasharray="3 3"
                    label={{ value: 'Target', position: 'right', fill: '#22c55e', fontSize: 12 }}
                  />
                )}
                <Bar dataKey="protein" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Fat Chart */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-gray-900">{t('fat')} (g)</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600">{language === 'ru' ? 'Среднее' : 'Average'}</div>
                <div className="text-orange-600">{weeklyAverages.fat.toFixed(1)}g</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayShort" />
                <YAxis />
                <Tooltip />
                {profile.fatTarget > 0 && (
                  <ReferenceLine 
                    y={profile.fatTarget} 
                    stroke="#f97316" 
                    strokeDasharray="3 3"
                    label={{ value: 'Target', position: 'right', fill: '#f97316', fontSize: 12 }}
                  />
                )}
                <Bar dataKey="fat" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Carbs Chart */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-gray-900">{t('carbs')} (g)</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600">{language === 'ru' ? 'Среднее' : 'Average'}</div>
                <div className="text-purple-600">{weeklyAverages.carbs.toFixed(1)}g</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayShort" />
                <YAxis />
                <Tooltip />
                {profile.carbsTarget > 0 && (
                  <ReferenceLine 
                    y={profile.carbsTarget} 
                    stroke="#a855f7" 
                    strokeDasharray="3 3"
                    label={{ value: 'Target', position: 'right', fill: '#a855f7', fontSize: 12 }}
                  />
                )}
                <Bar dataKey="carbs" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Calories Chart */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-gray-900">{t('calories')}</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600">{language === 'ru' ? 'Среднее' : 'Average'}</div>
                <div className="text-blue-600">{Math.round(weeklyAverages.calories)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayShort" />
                <YAxis />
                <Tooltip />
                {profile.caloriesTarget > 0 && (
                  <ReferenceLine 
                    y={profile.caloriesTarget} 
                    stroke="#3b82f6" 
                    strokeDasharray="3 3"
                    label={{ value: 'Target', position: 'right', fill: '#3b82f6', fontSize: 12 }}
                  />
                )}
                <Bar dataKey="calories" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
