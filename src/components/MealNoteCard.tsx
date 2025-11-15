import { MealNote, Language } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PencilIcon, Trash2Icon, CopyIcon } from './Icons';
import { useTranslation } from '../utils/translations';

interface MealNoteCardProps {
  mealNote: MealNote;
  onEdit: (mealNote: MealNote) => void;
  onDelete: (id: string) => void;
  onCopy?: (mealNote: MealNote) => void;
  language: Language;
}

export function MealNoteCard({ mealNote, onEdit, onDelete, onCopy, language }: MealNoteCardProps) {
  const { t } = useTranslation(language);
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-gray-900">{mealNote.name}</h3>
          {mealNote.description && (
            <p className="text-sm text-gray-500 mt-1">{mealNote.description}</p>
          )}
          {mealNote.items && mealNote.items.length > 1 && (
            <div className="mt-2 space-y-1">
              {mealNote.items.map(item => (
                <div key={item.id} className="text-xs text-gray-600">
                  • {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {onCopy && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopy(mealNote)}
              title={t('copy')}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(mealNote)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(mealNote.id)}
          >
            <Trash2Icon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t">
        <div className="flex gap-3 text-sm">
          <span className="text-green-600">P: {mealNote.protein.toFixed(1)}g</span>
          <span className="text-orange-600">F: {mealNote.fat.toFixed(1)}g</span>
          <span className="text-purple-600">C: {mealNote.carbs.toFixed(1)}g</span>
        </div>
        <div className="text-blue-600">
          {mealNote.calories} cal
        </div>
      </div>
    </Card>
  );
}
