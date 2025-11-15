import { useState, useEffect } from 'react';
import { MealRecipe, FoodItem, Language } from '../types';
import { CustomDialog } from './CustomDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { PlusIcon, Trash2Icon } from './Icons';
import { useTranslation } from '../utils/translations';

interface MealRecipeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<MealRecipe, 'id'>) => void;
  foods: FoodItem[];
  recipeType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  editingRecipe?: MealRecipe | null;
  onNavigateToFood?: (foodId: string) => void;
  language: Language;
}

export function MealRecipeForm({ 
  open, 
  onClose, 
  onSave, 
  foods, 
  recipeType,
  editingRecipe,
  onNavigateToFood,
  language 
}: MealRecipeFormProps) {
  const { t } = useTranslation(language);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<{ foodId: string; grams: number }[]>([]);

  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name);
      setDescription(editingRecipe.description);
      setIngredients(editingRecipe.ingredients);
    } else {
      resetForm();
    }
  }, [editingRecipe, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIngredients([]);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { foodId: '', grams: 100 }]);
  };

  const updateIngredient = (index: number, field: 'foodId' | 'grams', value: string | number) => {
    const updated = [...ingredients];
    if (field === 'foodId') {
      updated[index].foodId = value as string;
    } else {
      updated[index].grams = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ingredients.length === 0) {
      alert(language === 'ru' ? 'Добавьте хотя бы один ингредиент' : 'Please add at least one ingredient');
      return;
    }

    onSave({
      name,
      description,
      type: recipeType,
      ingredients
    });

    resetForm();
  };

  return (
    <CustomDialog 
      open={open} 
      onClose={onClose}
      title={editingRecipe 
        ? (language === 'ru' ? 'Редактировать рецепт' : 'Edit Recipe')
        : `${language === 'ru' ? 'Добавить' : 'Add'} ${recipeType.charAt(0).toUpperCase() + recipeType.slice(1)} ${language === 'ru' ? 'рецепт' : 'Recipe'}`
      }
      className="max-w-md max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipe-name" className="text-sm block mb-1">{t('name')}</label>
          <Input
            id="recipe-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'ru' ? 'напр., Протеиновый коктейль' : 'e.g., Protein Shake'}
            required
          />
        </div>

        <div>
          <label htmlFor="recipe-description" className="text-sm block mb-1">{t('description')}</label>
          <Textarea
            id="recipe-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={language === 'ru' ? 'Описание (необязательно)' : 'Optional description'}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm block">{language === 'ru' ? 'Ингредиенты' : 'Ingredients'}</label>
            <Button type="button" size="sm" onClick={addIngredient}>
              <PlusIcon className="h-4 w-4 mr-1" />
              {language === 'ru' ? 'Добавить' : 'Add'}
            </Button>
          </div>

          <div className="space-y-2">
            {ingredients.map((ingredient, index) => {
              const food = foods.find(f => f.id === ingredient.foodId);
              return (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs block mb-1">{language === 'ru' ? 'Продукт' : 'Food'}</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={ingredient.foodId}
                        onChange={(e) => updateIngredient(index, 'foodId', e.target.value)}
                        required
                      >
                        <option value="">{language === 'ru' ? 'Выберите продукт...' : 'Select food...'}</option>
                        {foods.map(food => (
                          <option key={food.id} value={food.id}>{food.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-xs block mb-1">{language === 'ru' ? 'Граммы' : 'Grams'}</label>
                      <Input
                        type="number"
                        value={ingredient.grams}
                        onChange={(e) => updateIngredient(index, 'grams', e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2Icon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  {food && onNavigateToFood && (
                    <button
                      type="button"
                      onClick={() => onNavigateToFood(food.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      → {language === 'ru' ? 'Перейти к продукту' : 'Go to food'}
                    </button>
                  )}
                </div>
              );
            })}

            {ingredients.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                {language === 'ru' ? 'Ингредиенты еще не добавлены' : 'No ingredients added yet'}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" className="flex-1">
            {editingRecipe ? t('update') : (language === 'ru' ? 'Добавить рецепт' : 'Add Recipe')}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
