import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { Button } from './ui/button';
import { formatDate, isSameDay } from '../utils/calculations';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';

interface CalendarRibbonProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  language: Language;
}

export function CalendarRibbon({ selectedDate, onDateSelect, language }: CalendarRibbonProps) {
  const { t } = useTranslation(language);
  const today = new Date();
  
  // Generate array of 7 days centered around selected date
  const getDays = () => {
    const days = [];
    const centerDate = new Date(selectedDate);
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const days = getDays();
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dayNames = language === 'ru' ? dayNamesRu : dayNamesEn;

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateSelect(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateSelect(newDate);
  };

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="flex items-center gap-2 p-4">
        <Button variant="ghost" size="icon" onClick={handlePrevDay}>
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 flex gap-1 overflow-x-auto">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            
            return (
              <button
                key={formatDate(day)}
                onClick={() => onDateSelect(day)}
                className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : isToday
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xs opacity-70">
                  {dayNames[day.getDay()]}
                </span>
                <span className="text-lg">
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <Button variant="ghost" size="icon" onClick={handleNextDay}>
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
