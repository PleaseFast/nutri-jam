import { useState } from 'react';
import { CustomDialog } from './CustomDialog';
import { Button } from './ui/button';
import { formatDate } from '../utils/calculations';
import { useTranslation } from '../utils/translations';
import { Language, MealNote } from '../types';

interface PasteDialogProps {
  open: boolean;
  onClose: () => void;
  onPaste: (dates: string[]) => void;
  copiedMealNote: MealNote | null;
  onClearClipboard: () => void;
  language: Language;
}

export function PasteDialog({ open, onClose, onPaste, copiedMealNote, onClearClipboard, language }: PasteDialogProps) {
  const { t } = useTranslation(language);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return formatDate(date);
  });

  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handlePaste = () => {
    if (selectedDates.length > 0) {
      onPaste(selectedDates);
      setSelectedDates([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedDates([]);
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      title={t('pasteTo')}
    >
      <div className="space-y-4">
        {/* Clipboard Contents */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm mb-2">{t('clipboardContents')}</div>
          {copiedMealNote ? (
            <div className="space-y-1">
              <div className="text-gray-900">{copiedMealNote.name}</div>
              {copiedMealNote.description && (
                <div className="text-sm text-gray-600">{copiedMealNote.description}</div>
              )}
              <div className="flex gap-2 text-xs text-gray-600 mt-2">
                <span>P: {copiedMealNote.protein}g</span>
                <span>F: {copiedMealNote.fat}g</span>
                <span>C: {copiedMealNote.carbs}g</span>
                <span>Cal: {copiedMealNote.calories}</span>
              </div>
              {copiedMealNote.items && copiedMealNote.items.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {copiedMealNote.items.length} {copiedMealNote.items.length === 1 ? 'item' : 'items'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">{t('noItemsInClipboard')}</div>
          )}
        </div>

        {copiedMealNote && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => {
              onClearClipboard();
              handleClose();
            }}
            className="w-full"
          >
            {t('clearClipboard')}
          </Button>
        )}
        
        <p className="text-sm text-gray-600">{t('selectDates')}</p>
        
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {dates.map(date => (
            <button
              key={date}
              type="button"
              onClick={() => toggleDate(date)}
              className={`p-3 rounded-lg text-sm text-left ${
                selectedDates.includes(date)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div>{date}</div>
              <div className="text-xs opacity-75">
                {new Date(date + 'T00:00:00').toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handlePaste}
            disabled={selectedDates.length === 0}
            className="flex-1"
          >
            {t('paste')} ({selectedDates.length})
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
}
