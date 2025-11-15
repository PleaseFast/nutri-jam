import { React, useState, useMemo, useEffect } from "react";
import {
  PlusIcon,
  BookOpenIcon,
  CalendarIcon,
  BarChart3Icon,
  UserIcon,
} from "./components/Icons";
import {
  MealNote,
  FoodItem,
  MealRecipe,
  DayTotals,
  UserProfile,
  WeightEntry,
  Language,
} from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { formatDate } from "./utils/calculations";
import { CalendarRibbon } from "./components/CalendarRibbon";
import { DayTotalsCard } from "./components/DayTotalsCard";
import { MealNoteCard } from "./components/MealNoteCard";
import { MealNoteForm } from "./components/MealNoteForm";
import { RecipeBook } from "./components/RecipeBook";
import { MePage } from "./components/MePage";
import { SummaryPage } from "./components/SummaryPage";
import { PasteDialog } from "./components/PasteDialog";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { useTranslation } from "./utils/translations";
import { toast } from "sonner";


type Page = "calendar" | "summary" | "me" | "recipeBook";

function App() {

  useEffect(() => {
    const tg = window.Telegram?.WebApp || null;

    tg.ready();   // Telegram сообщает: приложение загружено
    tg.expand();  // Развернуть на весь экран внутри Telegram
  }, []);

  const [language, setLanguage] = useLocalStorage<Language>(
    "language",
    "en",
  );
  const { t } = useTranslation(language);

  const [currentPage, setCurrentPage] =
    useState<Page>("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealNotes, setMealNotes] = useLocalStorage<MealNote[]>(
    "mealNotes",
    [],
  );
  const [foods, setFoods] = useLocalStorage<FoodItem[]>(
    "foods",
    [],
  );
  const [recipes, setRecipes] = useLocalStorage<MealRecipe[]>(
    "recipes",
    [],
  );
  const [profile, setProfile] = useLocalStorage<UserProfile>(
    "profile",
    {
      proteinTarget: 0,
      fatTarget: 0,
      carbsTarget: 0,
      caloriesTarget: 0,
    },
  );
  const [weightEntries, setWeightEntries] = useLocalStorage<
    WeightEntry[]
  >("weightEntries", []);

  const [showMealForm, setShowMealForm] = useState(false);
  const [editingNote, setEditingNote] =
    useState<MealNote | null>(null);
  const [copiedMealNote, setCopiedMealNote] =
    useState<MealNote | null>(null);
  const [showPasteDialog, setShowPasteDialog] = useState(false);

  const selectedDateStr = formatDate(selectedDate);

  const dayMealNotes = useMemo(() => {
    return mealNotes.filter(
      (note) => note.date === selectedDateStr,
    );
  }, [mealNotes, selectedDateStr]);

  const dayTotals = useMemo((): DayTotals => {
    return dayMealNotes.reduce(
      (acc, note) => ({
        protein: acc.protein + note.protein,
        fat: acc.fat + note.fat,
        carbs: acc.carbs + note.carbs,
        calories: acc.calories + note.calories,
      }),
      { protein: 0, fat: 0, carbs: 0, calories: 0 },
    );
  }, [dayMealNotes]);

  const handleAddMealNote = (
    mealNote: Omit<MealNote, "id">,
  ) => {
    const newNote: MealNote = {
      ...mealNote,
      id: Date.now().toString(),
    };
    setMealNotes([...mealNotes, newNote]);
  };

  const handleUpdateMealNote = (
    mealNote: Omit<MealNote, "id">,
  ) => {
    if (editingNote) {
      setMealNotes(
        mealNotes.map((note) =>
          note.id === editingNote.id
            ? { ...mealNote, id: editingNote.id }
            : note,
        ),
      );
      setEditingNote(null);
    }
  };

  const handleDeleteMealNote = (id: string) => {
    if (window.confirm(t("deleteMealConfirm"))) {
      setMealNotes(mealNotes.filter((note) => note.id !== id));
    }
  };

  const handleAddFood = (food: Omit<FoodItem, "id">) => {
    const newFood: FoodItem = {
      ...food,
      id: Date.now().toString(),
    };
    setFoods([...foods, newFood]);
  };

  const handleUpdateFood = (id: string, food: Omit<FoodItem, "id">) => {
    setFoods(
      foods.map((f) => (f.id === id ? { ...food, id } : f)),
    );
  };

  const handleAddRecipe = (recipe: Omit<MealRecipe, "id">) => {
    const newRecipe: MealRecipe = {
      ...recipe,
      id: Date.now().toString(),
    };
    setRecipes([...recipes, newRecipe]);
  };

  const handleUpdateRecipe = (id: string, recipe: Omit<MealRecipe, "id">) => {
    setRecipes(
      recipes.map((r) => (r.id === id ? { ...recipe, id } : r)),
    );
  };

  const handleDeleteFood = (id: string) => {
    setFoods(foods.filter((food) => food.id !== id));
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter((recipe) => recipe.id !== id));
  };

  const handleEditNote = (note: MealNote) => {
    setEditingNote(note);
    setShowMealForm(true);
  };

  const handleCopyMealNote = (note: MealNote) => {
    setCopiedMealNote(note);
    toast.success(t("mealNoteCopied"));
  };

  const handleClearClipboard = () => {
    setCopiedMealNote(null);
  };

  const handlePasteMealNote = (dates: string[]) => {
    if (!copiedMealNote) return;

    const newNotes: MealNote[] = dates.map((date) => ({
      ...copiedMealNote,
      id: `${Date.now()}-${date}`,
      date,
    }));

    setMealNotes([...mealNotes, ...newNotes]);
    setShowPasteDialog(false);
    toast.success(t("pasteComplete"));
  };

  const handleAddWeightEntry = (
    entry: Omit<WeightEntry, "id">,
  ) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setWeightEntries([...weightEntries, newEntry]);
  };

  const handleUpdateWeightEntry = (
    id: string,
    entry: Omit<WeightEntry, "id">,
  ) => {
    setWeightEntries(
      weightEntries.map((e) =>
        e.id === id ? { ...entry, id } : e,
      ),
    );
  };

  const handleDeleteWeightEntry = (id: string) => {
    setWeightEntries(weightEntries.filter((e) => e.id !== id));
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "calendar":
        return (
          <>
            <CalendarRibbon
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              language={language}
            />
            <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
              <DayTotalsCard
                totals={dayTotals}
                profile={profile}
                language={language}
              />

              <div className="space-y-3">
                {dayMealNotes.map((note) => (
                  <MealNoteCard
                    key={note.id}
                    mealNote={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteMealNote}
                    onCopy={handleCopyMealNote}
                    language={language}
                  />
                ))}

                {dayMealNotes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>{t("noMealNotes")}</p>
                    <p className="text-sm">{t("tapToAdd")}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case "summary":
        return (
          <SummaryPage
            mealNotes={mealNotes}
            profile={profile}
            language={language}
          />
        );

      case "me":
        return (
          <MePage
            profile={profile}
            onUpdateProfile={setProfile}
            weightEntries={weightEntries}
            onAddWeightEntry={handleAddWeightEntry}
            onUpdateWeightEntry={handleUpdateWeightEntry}
            onDeleteWeightEntry={handleDeleteWeightEntry}
            language={language}
            onToggleLanguage={toggleLanguage}
          />
        );

      case "recipeBook":
        return (
          <RecipeBook
            open={true}
            onClose={() => setCurrentPage("calendar")}
            foods={foods}
            recipes={recipes}
            onAddFood={handleAddFood}
            onUpdateFood={handleUpdateFood}
            onAddRecipe={handleAddRecipe}
            onUpdateRecipe={handleUpdateRecipe}
            onDeleteFood={handleDeleteFood}
            onDeleteRecipe={handleDeleteRecipe}
            language={language}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {renderPage()}

      {/* Fixed bottom navigation */}
      {currentPage !== "recipeBook" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="max-w-md mx-auto flex">
            <Button
              onClick={() => setCurrentPage("calendar")}
              variant={
                currentPage === "calendar" ? "default" : "ghost"
              }
              className="flex-1 rounded-none h-16 flex flex-col gap-1"
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="text-xs">{t("calendar")}</span>
            </Button>
            <Button
              onClick={() => setCurrentPage("summary")}
              variant={
                currentPage === "summary" ? "default" : "ghost"
              }
              className="flex-1 rounded-none h-16 flex flex-col gap-1"
            >
              <BarChart3Icon className="h-5 w-5" />
              <span className="text-xs">{t("summary")}</span>
            </Button>
            <Button
              onClick={() => setCurrentPage("me")}
              variant={
                currentPage === "me" ? "default" : "ghost"
              }
              className="flex-1 rounded-none h-16 flex flex-col gap-1"
            >
              <UserIcon className="h-5 w-5" />
              <span className="text-xs">{t("me")}</span>
            </Button>
            <Button
              onClick={() => setCurrentPage("recipeBook")}
              variant="ghost"
              className="flex-1 rounded-none h-16 flex flex-col gap-1"
            >
              <BookOpenIcon className="h-5 w-5" />
              <span className="text-xs">{t("recipeBook")}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Floating action button for adding meals (only on calendar page) */}
      {currentPage === "calendar" && (
        <div className="fixed bottom-20 right-4">
          <Button
            onClick={() => {
              setEditingNote(null);
              setShowMealForm(true);
            }}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Paste button (only on calendar page when there's a copied note) */}
      {currentPage === "calendar" && copiedMealNote && (
        <div className="fixed bottom-20 left-4">
          <Button
            onClick={() => setShowPasteDialog(true)}
            variant="secondary"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            📋
          </Button>
        </div>
      )}

      <MealNoteForm
        open={showMealForm}
        onClose={() => {
          setShowMealForm(false);
          setEditingNote(null);
        }}
        onSave={
          editingNote ? handleUpdateMealNote : handleAddMealNote
        }
        editingNote={editingNote}
        selectedDate={selectedDateStr}
        foods={foods}
        recipes={recipes}
        language={language}
      />

      <PasteDialog
        open={showPasteDialog}
        onClose={() => setShowPasteDialog(false)}
        onPaste={handlePasteMealNote}
        copiedMealNote={copiedMealNote}
        onClearClipboard={handleClearClipboard}
        language={language}
      />
    </div>
  );
}

export default App;