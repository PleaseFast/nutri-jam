import { useState, useEffect } from 'react';
import { FoodItem, Language, MealRecipe } from '../types';
import { CustomDialog } from './CustomDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { calculateCalories } from '../utils/calculations';
import { useTranslation } from '../utils/translations';

interface FoodItemFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (food: Omit<FoodItem, 'id'>) => void;
  editingFood?: FoodItem | null;
  usedInRecipes?: MealRecipe[];
  onNavigateToRecipe?: (recipeId: string) => void;
  language: Language;
}

export function FoodItemForm({ 
  open, 
  onClose, 
  onSave, 
  editingFood,
  usedInRecipes = [],
  onNavigateToRecipe,
  language 
}: FoodItemFormProps) {
  const { t } = useTranslation(language);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  useEffect(() => {
    if (editingFood) {
      setName(editingFood.name);
      setDescription(editingFood.description);
      setProtein(editingFood.protein.toString());
      setFat(editingFood.fat.toString());
      setCarbs(editingFood.carbs.toString());
    } else {
      resetForm();
    }
  }, [editingFood, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setProtein('');
    setFat('');
    setCarbs('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const proteinNum = parseFloat(protein) || 0;
    const fatNum = parseFloat(fat) || 0;
    const carbsNum = parseFloat(carbs) || 0;

    onSave({
      name,
      description,
      protein: proteinNum,
      fat: fatNum,
      carbs: carbsNum,
      calories: calculateCalories(proteinNum, fatNum, carbsNum)
    });

    resetForm();
  };

  return (
    <CustomDialog 
      open={open} 
      onClose={onClose}
      title={editingFood ? (language === 'ru' ? 'Редактировать продукт' : 'Edit Food') : t('addFood')}
      className="max-w-md max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="food-name" className="text-sm block mb-1">{t('name')}</label>
          <Input
            id="food-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="food-description" className="text-sm block mb-1">{t('description')}</label>
          <Textarea
            id="food-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm block">{language === 'ru' ? 'Пищевая ценность на 100г' : 'Nutritional values per 100g'}</label>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="food-protein" className="text-xs block mb-1">{t('protein')} (g)</label>
              <Input
                id="food-protein"
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="food-fat" className="text-xs block mb-1">{t('fat')} (g)</label>
              <Input
                id="food-fat"
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="food-carbs" className="text-xs block mb-1">{t('carbs')} (g)</label>
              <Input
                id="food-carbs"
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <div className="text-sm text-gray-600">{language === 'ru' ? 'Калории на 100г' : 'Calories per 100g'}</div>
          <div className="text-2xl text-blue-600">
            {calculateCalories(parseFloat(protein) || 0, parseFloat(fat) || 0, parseFloat(carbs) || 0)}
          </div>
        </div>

        {editingFood && usedInRecipes.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm mb-2">
              {language === 'ru' 
                ? `Используется в ${usedInRecipes.length} рецептах:` 
                : `Used in ${usedInRecipes.length} recipes:`}
            </div>
            <div className="space-y-1">
              {usedInRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => {
                    if (onNavigateToRecipe) {
                      onNavigateToRecipe(recipe.id);
                    }
                  }}
                  className="text-sm text-blue-600 hover:underline block"
                >
                  → {recipe.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" className="flex-1">
            {editingFood ? t('update') : t('addFood')}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
