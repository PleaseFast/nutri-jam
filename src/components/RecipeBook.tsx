import { useState } from 'react';
import { FoodItem, MealRecipe, Language } from '../types';
import { CustomSheet } from './CustomSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './CustomTabs';
import { Button } from './ui/button';
import { PlusIcon, EditIcon } from './Icons';
import { FoodItemForm } from './FoodItemForm';
import { MealRecipeForm } from './MealRecipeForm';
import { Card } from './ui/card';
import { useTranslation } from '../utils/translations';
import { ChevronDownIcon, ChevronRightIcon } from './Icons';

interface RecipeBookProps {
  open: boolean;
  onClose: () => void;
  foods: FoodItem[];
  recipes: MealRecipe[];
  onAddFood: (food: Omit<FoodItem, 'id'>) => void;
  onUpdateFood: (id: string, food: Omit<FoodItem, 'id'>) => void;
  onAddRecipe: (recipe: Omit<MealRecipe, 'id'>) => void;
  onUpdateRecipe: (id: string, recipe: Omit<MealRecipe, 'id'>) => void;
  onDeleteFood: (id: string) => void;
  onDeleteRecipe: (id: string) => void;
  language: Language;
}

export function RecipeBook({
  open,
  onClose,
  foods,
  recipes,
  onAddFood,
  onUpdateFood,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteFood,
  onDeleteRecipe,
  language
}: RecipeBookProps) {
  const { t } = useTranslation(language);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipeType, setRecipeType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<MealRecipe | null>(null);
  const [activeTab, setActiveTab] = useState('foods');
  const [navigationTarget, setNavigationTarget] = useState<{ type: 'food' | 'recipe'; id: string } | null>(null);
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

  const toggleRecipeExpanded = (recipeId: string) => {
    const newExpanded = new Set(expandedRecipes);
    if (newExpanded.has(recipeId)) {
      newExpanded.delete(recipeId);
    } else {
      newExpanded.add(recipeId);
    }
    setExpandedRecipes(newExpanded);
  };

  const getRecipesByType = (type: string) => {
    return recipes.filter(r => r.type === type);
  };

  const getRecipesUsingFood = (foodId: string) => {
    return recipes.filter(recipe => 
      recipe.ingredients.some(ing => ing.foodId === foodId)
    );
  };

  const calculateRecipeNutrients = (recipe: MealRecipe) => {
    let protein = 0, fat = 0, carbs = 0, calories = 0;
    
    recipe.ingredients.forEach(ing => {
      const food = foods.find(f => f.id === ing.foodId);
      if (food) {
        const multiplier = ing.grams / 100;
        protein += food.protein * multiplier;
        fat += food.fat * multiplier;
        carbs += food.carbs * multiplier;
        calories += food.calories * multiplier;
      }
    });
    
    return { protein: protein.toFixed(1), fat: fat.toFixed(1), carbs: carbs.toFixed(1), calories: Math.round(calories) };
  };

  const calculateIngredientNutrients = (foodId: string, grams: number) => {
    const food = foods.find(f => f.id === foodId);
    if (!food) return null;
    
    const multiplier = grams / 100;
    return {
      protein: (food.protein * multiplier).toFixed(1),
      fat: (food.fat * multiplier).toFixed(1),
      carbs: (food.carbs * multiplier).toFixed(1),
      calories: Math.round(food.calories * multiplier),
    };
  };

  const handleNavigateToRecipe = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      const tabMap: Record<string, string> = {
        'breakfast': 'breakfast',
        'lunch': 'lunch',
        'dinner': 'dinner',
        'snack': 'snacks'
      };
      setActiveTab(tabMap[recipe.type]);
      setNavigationTarget({ type: 'recipe', id: recipeId });
      setShowFoodForm(false);
    }
  };

  const handleNavigateToFood = (foodId: string) => {
    setActiveTab('foods');
    setNavigationTarget({ type: 'food', id: foodId });
    setShowRecipeForm(false);
  };

  const handleEditFood = (food: FoodItem) => {
    setEditingFood(food);
    setShowFoodForm(true);
  };

  const handleEditRecipe = (recipe: MealRecipe) => {
    setEditingRecipe(recipe);
    setRecipeType(recipe.type);
    setShowRecipeForm(true);
  };

  const handleSaveFood = (food: Omit<FoodItem, 'id'>) => {
    if (editingFood) {
      onUpdateFood(editingFood.id, food);
      setEditingFood(null);
    } else {
      onAddFood(food);
    }
    setShowFoodForm(false);
  };

  const handleSaveRecipe = (recipe: Omit<MealRecipe, 'id'>) => {
    if (editingRecipe) {
      onUpdateRecipe(editingRecipe.id, recipe);
      setEditingRecipe(null);
    } else {
      onAddRecipe(recipe);
    }
    setShowRecipeForm(false);
  };

  return (
    <>
      <CustomSheet open={open} onClose={onClose} title={t('recipeBook')}>
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="foods">{t('foods')}</TabsTrigger>
              <TabsTrigger value="breakfast">{t('breakfast')}</TabsTrigger>
              <TabsTrigger value="lunch">{t('lunch')}</TabsTrigger>
              <TabsTrigger value="dinner">{t('dinner')}</TabsTrigger>
              <TabsTrigger value="snacks">{t('snacks')}</TabsTrigger>
            </TabsList>

            <TabsContent value="foods" className="space-y-3 max-h-[calc(90vh-180px)] overflow-y-auto">
              <Button 
                onClick={() => {
                  setEditingFood(null);
                  setShowFoodForm(true);
                }} 
                className="w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('addFood')}
              </Button>

              {foods.map(food => {
                const usedInRecipes = getRecipesUsingFood(food.id);
                const isHighlighted = navigationTarget?.type === 'food' && navigationTarget.id === food.id;
                
                return (
                  <Card 
                    key={food.id} 
                    className={`p-3 ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4>{food.name}</h4>
                        {food.description && (
                          <p className="text-sm text-gray-500">{food.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFood(food)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(language === 'ru' ? 'Удалить этот продукт?' : 'Delete this food?')) {
                              onDeleteFood(food.id);
                            }
                          }}
                          className="text-red-500"
                        >
                          {t('delete')}
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {t('per100g')}: P: {food.protein}g | F: {food.fat}g | C: {food.carbs}g | {food.calories} cal
                    </div>
                    {usedInRecipes.length > 0 && (
                      <div className="text-xs text-blue-600">
                        {language === 'ru' 
                          ? `Используется в ${usedInRecipes.length} рецептах` 
                          : `Used in ${usedInRecipes.length} recipe${usedInRecipes.length !== 1 ? 's' : ''}`}
                      </div>
                    )}
                  </Card>
                );
              })}

              {foods.length === 0 && (
                <p className="text-center text-gray-500 py-8">{language === 'ru' ? 'Продукты еще не добавлены' : 'No food items yet'}</p>
              )}
            </TabsContent>

            {['breakfast', 'lunch', 'dinner', 'snacks'].map(type => (
              <TabsContent key={type} value={type} className="space-y-3 max-h-[calc(90vh-180px)] overflow-y-auto">
                <Button
                  onClick={() => {
                    setEditingRecipe(null);
                    setRecipeType(type === 'snacks' ? 'snack' : type as any);
                    setShowRecipeForm(true);
                  }}
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t('addRecipe')}
                </Button>

                {getRecipesByType(type === 'snacks' ? 'snack' : type).map(recipe => {
                  const nutrients = calculateRecipeNutrients(recipe);
                  const isHighlighted = navigationTarget?.type === 'recipe' && navigationTarget.id === recipe.id;
                  const isExpanded = expandedRecipes.has(recipe.id);
                  
                  return (
                    <Card 
                      key={recipe.id} 
                      className={`p-3 ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4>{recipe.name}</h4>
                          {recipe.description && (
                            <p className="text-sm text-gray-500">{recipe.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecipe(recipe)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(language === 'ru' ? 'Удалить этот рецепт?' : 'Delete this recipe?')) {
                                onDeleteRecipe(recipe.id);
                              }
                            }}
                            className="text-red-500"
                          >
                            {t('delete')}
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        P: {nutrients.protein}g | F: {nutrients.fat}g | C: {nutrients.carbs}g | {nutrients.calories} cal
                      </div>
                      
                      {/* Collapsible ingredients section */}
                      <button
                        type="button"
                        onClick={() => toggleRecipeExpanded(recipe.id)}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:text-blue-600 mb-2"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="h-3 w-3" />
                        ) : (
                          <ChevronRightIcon className="h-3 w-3" />
                        )}
                        {language === 'ru' ? 'Ингредиенты' : 'Ingredients'} ({recipe.ingredients.length})
                      </button>
                      
                      {isExpanded && (
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                          {recipe.ingredients.map((ing, idx) => {
                            const food = foods.find(f => f.id === ing.foodId);
                            const ingNutrients = calculateIngredientNutrients(ing.foodId, ing.grams);
                            return food && ingNutrients ? (
                              <div key={idx} className="text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-700">• {food.name}</span>
                                  <span className="text-gray-600">{ing.grams}g</span>
                                </div>
                                <div className="text-gray-500 pl-3">
                                  P: {ingNutrients.protein}g | F: {ingNutrients.fat}g | C: {ingNutrients.carbs}g | {ingNutrients.calories} cal
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}

                {getRecipesByType(type === 'snacks' ? 'snack' : type).length === 0 && (
                  <p className="text-center text-gray-500 py-8">{language === 'ru' ? 'Рецепты еще не добавлены' : 'No recipes yet'}</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CustomSheet>

      <FoodItemForm
        open={showFoodForm}
        onClose={() => {
          setShowFoodForm(false);
          setEditingFood(null);
        }}
        onSave={handleSaveFood}
        editingFood={editingFood}
        usedInRecipes={editingFood ? getRecipesUsingFood(editingFood.id) : []}
        onNavigateToRecipe={handleNavigateToRecipe}
        language={language}
      />

      <MealRecipeForm
        open={showRecipeForm}
        onClose={() => {
          setShowRecipeForm(false);
          setEditingRecipe(null);
        }}
        onSave={handleSaveRecipe}
        foods={foods}
        recipeType={recipeType}
        editingRecipe={editingRecipe}
        onNavigateToFood={handleNavigateToFood}
        language={language}
      />
    </>
  );
}
