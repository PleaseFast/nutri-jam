import { Language } from '../types';

export const translations = {
  en: {
    // Navigation
    calendar: 'Calendar',
    summary: 'Summary',
    me: 'Me',
    recipeBook: 'Recipe Book',
    
    // Meal Notes
    addMeal: 'Add Meal',
    editMealNote: 'Edit Meal Note',
    addMealNote: 'Add Meal Note',
    noMealNotes: 'No meal notes for this day',
    tapToAdd: 'Tap the + button to add one',
    deleteMealConfirm: 'Are you sure you want to delete this meal note?',
    
    // Form fields
    name: 'Name',
    description: 'Description',
    protein: 'Protein',
    fat: 'Fat',
    carbs: 'Carbs',
    calories: 'Calories',
    grams: 'grams',
    amount: 'Amount',
    
    // Tabs
    manual: 'Manual',
    food: 'Food',
    recipe: 'Recipe',
    
    // Buttons
    cancel: 'Cancel',
    save: 'Save',
    update: 'Update',
    add: 'Add',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    paste: 'Paste',
    remove: 'Remove',
    addItem: 'Add Item',
    
    // Food/Recipe selection
    selectFood: 'Select Food',
    selectRecipe: 'Select Recipe',
    chooseFood: 'Choose a food...',
    chooseRecipe: 'Choose a recipe...',
    nameOverride: 'Name (optional override)',
    
    // Meal note items
    items: 'Items',
    addedItems: 'Added Items',
    noItems: 'No items added yet',
    
    // Day totals
    total: 'Total',
    todayTotal: "Today's Total",
    
    // Recipe book
    foods: 'Foods',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
    addFood: 'Add Food',
    addRecipe: 'Add Recipe',
    editFood: 'Edit Food',
    editRecipe: 'Edit Recipe',
    per100g: 'per 100g',
    recipeType: 'Recipe Type',
    ingredients: 'Ingredients',
    addIngredient: 'Add Ingredient',
    
    // Me page
    profile: 'Profile',
    dailyTargets: 'Daily Targets',
    proteinTarget: 'Protein Target',
    fatTarget: 'Fat Target',
    carbsTarget: 'Carbs Target',
    caloriesTarget: 'Calories Target',
    weighIns: 'Weigh-ins',
    addWeighIn: 'Add Weigh-in',
    editWeighIn: 'Edit Weigh-in',
    setStartingWeight: 'Set as Starting Weight',
    startingWeight: 'Starting Weight',
    currentWeight: 'Current Weight',
    weightChange: 'Weight Change',
    date: 'Date',
    weight: 'Weight',
    kg: 'kg',
    noWeighIns: 'No weigh-ins recorded',
    
    // Summary page
    weeklyStats: 'Weekly Statistics',
    weekOf: 'Week of',
    average: 'Average',
    dailyAverage: 'Daily Average',
    weeklyTotal: 'Weekly Total',
    
    // Copy/Paste
    copyMealNote: 'Copy Meal Note',
    pasteTo: 'Paste to',
    selectDates: 'Select dates to paste meal note',
    mealNoteCopied: 'Meal note copied',
    pasteComplete: 'Meal note pasted',
    clipboardContents: 'Clipboard Contents',
    clearClipboard: 'Clear Clipboard',
    noItemsInClipboard: 'No meal note in clipboard',
    autoCalculated: 'Auto-calculated',
    change: 'Change',
    
    // Days of week
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  },
  ru: {
    // Навигация
    calendar: 'Календарь',
    summary: 'Статистика',
    me: 'Профиль',
    recipeBook: 'Книга рецептов',
    
    // Записи о приемах пищи
    addMeal: 'Добавить прием пищи',
    editMealNote: 'Редактировать запись',
    addMealNote: 'Добавить запись',
    noMealNotes: 'Нет записей за этот день',
    tapToAdd: 'Нажмите + чтобы добавить',
    deleteMealConfirm: 'Вы уверены, что хотите удалить эту запись?',
    
    // Поля формы
    name: 'Название',
    description: 'Описание',
    protein: 'Белки',
    fat: 'Жиры',
    carbs: 'Углеводы',
    calories: 'Калории',
    grams: 'грамм',
    amount: 'Количество',
    
    // Вкладки
    manual: 'Вручную',
    food: 'Продукт',
    recipe: 'Рецепт',
    
    // Кнопки
    cancel: 'Отмена',
    save: 'Сохранить',
    update: 'Обновить',
    add: 'Добавить',
    delete: 'Удалить',
    edit: 'Изменить',
    copy: 'Копировать',
    paste: 'Вставить',
    remove: 'Удалить',
    addItem: 'Добавить элемент',
    
    // Выбор продукта/рецепта
    selectFood: 'Выберите продукт',
    selectRecipe: 'Выберите рецепт',
    chooseFood: 'Выберите продукт...',
    chooseRecipe: 'Выберите рецепт...',
    nameOverride: 'Название (можно изменить)',
    
    // Элементы записи о приеме пищи
    items: 'Элементы',
    addedItems: 'Добавленные элементы',
    noItems: 'Элементы еще не добавлены',
    
    // Итоги дня
    total: 'Всего',
    todayTotal: 'Всего за сегодня',
    
    // Книга рецептов
    foods: 'Продукты',
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snacks: 'Перекусы',
    addFood: 'Добавить продукт',
    addRecipe: 'Добавить рецепт',
    editFood: 'Изменить продукт',
    editRecipe: 'Изменить рецепт',
    per100g: 'на 100г',
    recipeType: 'Тип рецепта',
    ingredients: 'Ингредиенты',
    addIngredient: 'Добавить ингредиент',
    
    // Страница профиля
    profile: 'Профиль',
    dailyTargets: 'Дневные цели',
    proteinTarget: 'Цель по белкам',
    fatTarget: 'Цель по жирам',
    carbsTarget: 'Цель по углеводам',
    caloriesTarget: 'Цель по калориям',
    weighIns: 'Взвешивания',
    addWeighIn: 'Добавить взвешивание',
    editWeighIn: 'Изменить взвешивание',
    setStartingWeight: 'Установить начальный вес',
    startingWeight: 'Начальный вес',
    currentWeight: 'Текущий вес',
    weightChange: 'Изменение веса',
    date: 'Дата',
    weight: 'Вес',
    kg: 'кг',
    noWeighIns: 'Нет записей о взвешиваниях',
    
    // Страница статистики
    weeklyStats: 'Недельная статистика',
    weekOf: 'Неделя',
    average: 'Среднее',
    dailyAverage: 'Среднее в день',
    weeklyTotal: 'Всего за неделю',
    
    // Копирование/Вставка
    copyMealNote: 'Копировать запись',
    pasteTo: 'Вставить в',
    selectDates: 'Выберите даты для вставки записи',
    mealNoteCopied: 'Запись скопирована',
    pasteComplete: 'Запись вставлена',
    clipboardContents: 'Содержимое буфера',
    clearClipboard: 'Очистить буфер',
    noItemsInClipboard: 'Буфер обмена пуст',
    autoCalculated: 'Рассчитывается автоматически',
    change: 'Изменение',
    
    // Дни недели
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
  },
};

export function useTranslation(lang: Language) {
  return {
    t: (key: keyof typeof translations.en): string => {
      return translations[lang][key] || translations.en[key] || key;
    },
    lang,
  };
}
