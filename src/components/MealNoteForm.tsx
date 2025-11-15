import { useState, useEffect } from 'react';
import { MealNote, MealNoteItem, FoodItem, MealRecipe } from '../types';
import { CustomDialog } from './CustomDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './CustomTabs';
import { calculateCalories } from '../utils/calculations';
import { Trash2Icon, PencilIcon } from './Icons';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';

interface MealNoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (mealNote: Omit<MealNote, 'id'>) => void;
  editingNote?: MealNote | null;
  selectedDate: string;
  foods: FoodItem[];
  recipes: MealRecipe[];
  language: Language;
}

export function MealNoteForm({
  open,
  onClose,
  onSave,
  editingNote,
  selectedDate,
  foods,
  recipes,
  language
}: MealNoteFormProps) {
  const { t } = useTranslation(language);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<MealNoteItem[]>([]);
  const [inputMode, setInputMode] = useState<'manual' | 'food' | 'recipe'>('manual');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Manual input
  const [manualName, setManualName] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  
  // Food input
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [foodGrams, setFoodGrams] = useState('100');
  
  // Recipe input
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

  useEffect(() => {
    if (editingNote) {
      setName(editingNote.name);
      setDescription(editingNote.description);
      
      // Handle backward compatibility
      if (editingNote.items && editingNote.items.length > 0) {
        setItems(editingNote.items);
      } else {
        // Convert old format to new format
        setItems([{
          id: Date.now().toString(),
          name: editingNote.name,
          protein: editingNote.protein,
          fat: editingNote.fat,
          carbs: editingNote.carbs,
          calories: editingNote.calories,
          sourceType: editingNote.sourceType || 'manual',
          sourceId: editingNote.sourceId,
        }]);
      }
    } else {
      resetForm();
    }
  }, [editingNote, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setItems([]);
    setInputMode('manual');
    setEditingItemId(null);
    resetItemInputs();
  };

  const resetItemInputs = () => {
    setManualName('');
    setProtein('');
    setFat('');
    setCarbs('');
    setSelectedFoodId('');
    setFoodGrams('100');
    setSelectedRecipeId('');
  };

  const handleAddManualItem = () => {
    if (!manualName || !protein || !fat || !carbs) return;
    
    const proteinNum = parseFloat(protein);
    const fatNum = parseFloat(fat);
    const carbsNum = parseFloat(carbs);
    const calories = calculateCalories(proteinNum, fatNum, carbsNum);
    
    if (editingItemId) {
      // Update existing item
      setItems(items.map(item => 
        item.id === editingItemId
          ? {
              ...item,
              name: manualName,
              protein: proteinNum,
              fat: fatNum,
              carbs: carbsNum,
              calories,
            }
          : item
      ));
      setEditingItemId(null);
    } else {
      // Add new item
      const newItem: MealNoteItem = {
        id: Date.now().toString(),
        name: manualName,
        protein: proteinNum,
        fat: fatNum,
        carbs: carbsNum,
        calories,
        sourceType: 'manual',
      };
      setItems([...items, newItem]);
    }
    
    resetItemInputs();
  };

  const handleAddFoodItem = () => {
    if (!selectedFoodId) return;
    
    const food = foods.find(f => f.id === selectedFoodId);
    if (!food) return;
    
    const grams = parseFloat(foodGrams) || 100;
    const multiplier = grams / 100;
    
    const proteinNum = food.protein * multiplier;
    const fatNum = food.fat * multiplier;
    const carbsNum = food.carbs * multiplier;
    const calories = calculateCalories(proteinNum, fatNum, carbsNum);
    
    if (editingItemId) {
      // Update existing item
      setItems(items.map(item => 
        item.id === editingItemId
          ? {
              ...item,
              name: `${food.name} (${grams}${t('grams')})`,
              protein: proteinNum,
              fat: fatNum,
              carbs: carbsNum,
              calories,
              grams,
            }
          : item
      ));
      setEditingItemId(null);
    } else {
      // Add new item
      const newItem: MealNoteItem = {
        id: Date.now().toString(),
        name: `${food.name} (${grams}${t('grams')})`,
        protein: proteinNum,
        fat: fatNum,
        carbs: carbsNum,
        calories,
        sourceType: 'food',
        sourceId: food.id,
        grams,
      };
      setItems([...items, newItem]);
    }
    
    resetItemInputs();
  };

  const handleAddRecipeItem = () => {
    if (!selectedRecipeId) return;
    
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;
    
    let totalProtein = 0, totalFat = 0, totalCarbs = 0;
    
    recipe.ingredients.forEach(ing => {
      const food = foods.find(f => f.id === ing.foodId);
      if (food) {
        const multiplier = ing.grams / 100;
        totalProtein += food.protein * multiplier;
        totalFat += food.fat * multiplier;
        totalCarbs += food.carbs * multiplier;
      }
    });
    
    const calories = calculateCalories(totalProtein, totalFat, totalCarbs);
    
    if (editingItemId) {
      // Update existing item
      setItems(items.map(item => 
        item.id === editingItemId
          ? {
              ...item,
              name: recipe.name,
              protein: totalProtein,
              fat: totalFat,
              carbs: totalCarbs,
              calories,
            }
          : item
      ));
      setEditingItemId(null);
    } else {
      // Add new item
      const newItem: MealNoteItem = {
        id: Date.now().toString(),
        name: recipe.name,
        protein: totalProtein,
        fat: totalFat,
        carbs: totalCarbs,
        calories,
        sourceType: 'recipe',
        sourceId: recipe.id,
      };
      setItems([...items, newItem]);
    }
    
    resetItemInputs();
  };

  const handleEditItem = (item: MealNoteItem) => {
    setEditingItemId(item.id);
    
    if (item.sourceType === 'manual') {
      setInputMode('manual');
      setManualName(item.name);
      setProtein(item.protein.toString());
      setFat(item.fat.toString());
      setCarbs(item.carbs.toString());
    } else if (item.sourceType === 'food' && item.sourceId) {
      setInputMode('food');
      setSelectedFoodId(item.sourceId);
      setFoodGrams(item.grams?.toString() || '100');
    } else if (item.sourceType === 'recipe' && item.sourceId) {
      setInputMode('recipe');
      setSelectedRecipeId(item.sourceId);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    if (editingItemId === itemId) {
      setEditingItemId(null);
      resetItemInputs();
    }
  };

  const hasPendingItem = () => {
    if (inputMode === 'manual') {
      return !!(manualName || protein || fat || carbs);
    } else if (inputMode === 'food') {
      return !!selectedFoodId;
    } else if (inputMode === 'recipe') {
      return !!selectedRecipeId;
    }
    return false;
  };

  const addPendingItem = () => {
    if (inputMode === 'manual' && manualName && protein && fat && carbs) {
      handleAddManualItem();
    } else if (inputMode === 'food' && selectedFoodId) {
      handleAddFoodItem();
    } else if (inputMode === 'recipe' && selectedRecipeId) {
      handleAddRecipeItem();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-add pending item if exists
    if (hasPendingItem()) {
      addPendingItem();
      
      // Wait for state to update, then save
      setTimeout(() => {
        saveNote();
      }, 10);
    } else {
      saveNote();
    }
  };

  const saveNote = () => {
    // Get the current items (may have just been updated)
    const finalItems = [...items];
    
    // Add pending item if needed
    if (hasPendingItem()) {
      if (inputMode === 'manual' && manualName && protein && fat && carbs) {
        const proteinNum = parseFloat(protein);
        const fatNum = parseFloat(fat);
        const carbsNum = parseFloat(carbs);
        finalItems.push({
          id: Date.now().toString(),
          name: manualName,
          protein: proteinNum,
          fat: fatNum,
          carbs: carbsNum,
          calories: calculateCalories(proteinNum, fatNum, carbsNum),
          sourceType: 'manual',
        });
      } else if (inputMode === 'food' && selectedFoodId) {
        const food = foods.find(f => f.id === selectedFoodId);
        if (food) {
          const grams = parseFloat(foodGrams) || 100;
          const multiplier = grams / 100;
          const proteinNum = food.protein * multiplier;
          const fatNum = food.fat * multiplier;
          const carbsNum = food.carbs * multiplier;
          finalItems.push({
            id: Date.now().toString(),
            name: `${food.name} (${grams}${t('grams')})`,
            protein: proteinNum,
            fat: fatNum,
            carbs: carbsNum,
            calories: calculateCalories(proteinNum, fatNum, carbsNum),
            sourceType: 'food',
            sourceId: food.id,
            grams,
          });
        }
      } else if (inputMode === 'recipe' && selectedRecipeId) {
        const recipe = recipes.find(r => r.id === selectedRecipeId);
        if (recipe) {
          let totalProtein = 0, totalFat = 0, totalCarbs = 0;
          recipe.ingredients.forEach(ing => {
            const food = foods.find(f => f.id === ing.foodId);
            if (food) {
              const multiplier = ing.grams / 100;
              totalProtein += food.protein * multiplier;
              totalFat += food.fat * multiplier;
              totalCarbs += food.carbs * multiplier;
            }
          });
          finalItems.push({
            id: Date.now().toString(),
            name: recipe.name,
            protein: totalProtein,
            fat: totalFat,
            carbs: totalCarbs,
            calories: calculateCalories(totalProtein, totalFat, totalCarbs),
            sourceType: 'recipe',
            sourceId: recipe.id,
          });
        }
      }
    }
    
    if (finalItems.length === 0) {
      alert(language === 'ru' ? 'Добавьте хотя бы один элемент' : 'Please add at least one item');
      return;
    }
    
    const totals = finalItems.reduce(
      (acc, item) => ({
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs,
        calories: acc.calories + item.calories,
      }),
      { protein: 0, fat: 0, carbs: 0, calories: 0 }
    );

    onSave({
      date: selectedDate,
      name: name || finalItems[0].name,
      description,
      items: finalItems,
      protein: totals.protein,
      fat: totals.fat,
      carbs: totals.carbs,
      calories: totals.calories,
    });

    resetForm();
    onClose();
  };

  const totals = items.reduce(
    (acc, item) => ({
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
      calories: acc.calories + item.calories,
    }),
    { protein: 0, fat: 0, carbs: 0, calories: 0 }
  );

  return (
    <CustomDialog 
      open={open} 
      onClose={onClose}
      title={editingNote ? t('editMealNote') : t('addMealNote')}
      className="max-w-md max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Overall meal name and description */}
        <div>
          <label htmlFor="meal-name" className="text-sm block mb-1">{t('name')}</label>
          <Input
            id="meal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={items.length > 0 ? items[0].name : ''}
          />
        </div>

        <div>
          <label htmlFor="meal-description" className="text-sm block mb-1">{t('description')}</label>
          <Textarea
            id="meal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Added items list */}
        {items.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('addedItems')}</span>
              <span className="text-sm text-gray-600">{items.length}</span>
            </div>
            {items.map(item => (
              <div key={item.id} className={`flex justify-between items-center p-2 rounded ${editingItemId === item.id ? 'bg-blue-100' : 'bg-white'}`}>
                <div className="flex-1">
                  <div className="text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    P: {item.protein.toFixed(1)}g | F: {item.fat.toFixed(1)}g | C: {item.carbs.toFixed(1)}g | {item.calories} cal
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditItem(item)}
                  >
                    <PencilIcon className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2Icon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>{t('total')}:</span>
                <span>
                  P: {totals.protein.toFixed(1)}g | F: {totals.fat.toFixed(1)}g | C: {totals.carbs.toFixed(1)}g | {totals.calories} cal
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Add items section */}
        <Tabs value={inputMode} onValueChange={(v) => {
          setInputMode(v as any);
          setEditingItemId(null);
          resetItemInputs();
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">{t('manual')}</TabsTrigger>
            <TabsTrigger value="food">{t('food')}</TabsTrigger>
            <TabsTrigger value="recipe">{t('recipe')}</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-3">
            <div>
              <label className="text-sm block mb-1">{t('name')}</label>
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm block mb-1">{t('protein')} (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm block mb-1">{t('fat')} (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm block mb-1">{t('carbs')} (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
            </div>

            <div className="p-2 bg-blue-50 rounded text-center text-sm">
              {t('calories')}: {calculateCalories(parseFloat(protein) || 0, parseFloat(fat) || 0, parseFloat(carbs) || 0)}
            </div>

            <Button type="button" onClick={handleAddManualItem} className="w-full">
              {editingItemId ? t('update') : t('addItem')}
            </Button>
          </TabsContent>

          <TabsContent value="food" className="space-y-3">
            <div>
              <label className="text-sm block mb-1">{t('selectFood')}</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
              >
                <option value="">{t('chooseFood')}</option>
                {foods.map(food => (
                  <option key={food.id} value={food.id}>{food.name}</option>
                ))}
              </select>
            </div>

            {selectedFoodId && (
              <>
                <div>
                  <label className="text-sm block mb-1">{t('amount')} ({t('grams')})</label>
                  <Input
                    type="number"
                    value={foodGrams}
                    onChange={(e) => setFoodGrams(e.target.value)}
                  />
                </div>

                <div className="p-2 bg-gray-50 rounded text-sm">
                  {(() => {
                    const food = foods.find(f => f.id === selectedFoodId);
                    if (!food) return null;
                    const grams = parseFloat(foodGrams) || 100;
                    const multiplier = grams / 100;
                    return (
                      <div>
                        <div>P: {(food.protein * multiplier).toFixed(1)}g</div>
                        <div>F: {(food.fat * multiplier).toFixed(1)}g</div>
                        <div>C: {(food.carbs * multiplier).toFixed(1)}g</div>
                        <div>{calculateCalories(food.protein * multiplier, food.fat * multiplier, food.carbs * multiplier)} cal</div>
                      </div>
                    );
                  })()}
                </div>

                <Button type="button" onClick={handleAddFoodItem} className="w-full">
                  {editingItemId ? t('update') : t('addItem')}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="recipe" className="space-y-3">
            <div>
              <label className="text-sm block mb-1">{t('selectRecipe')}</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
              >
                <option value="">{t('chooseRecipe')}</option>
                {recipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} ({recipe.type})
                  </option>
                ))}
              </select>
            </div>

            {selectedRecipeId && (
              <>
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {(() => {
                    const recipe = recipes.find(r => r.id === selectedRecipeId);
                    if (!recipe) return null;
                    let totalProtein = 0, totalFat = 0, totalCarbs = 0;
                    recipe.ingredients.forEach(ing => {
                      const food = foods.find(f => f.id === ing.foodId);
                      if (food) {
                        const multiplier = ing.grams / 100;
                        totalProtein += food.protein * multiplier;
                        totalFat += food.fat * multiplier;
                        totalCarbs += food.carbs * multiplier;
                      }
                    });
                    return (
                      <div>
                        <div>P: {totalProtein.toFixed(1)}g</div>
                        <div>F: {totalFat.toFixed(1)}g</div>
                        <div>C: {totalCarbs.toFixed(1)}g</div>
                        <div>{calculateCalories(totalProtein, totalFat, totalCarbs)} cal</div>
                      </div>
                    );
                  })()}
                </div>

                <Button type="button" onClick={handleAddRecipeItem} className="w-full">
                  {editingItemId ? t('update') : t('addItem')}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" className="flex-1">
            {editingNote ? t('update') : t('add')}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
