// Utility functions for calorie and nutrient calculations

export function calculateCalories(protein: number, fat: number, carbs: number): number {
  // Protein: 4 cal/g, Fat: 9 cal/g, Carbs: 4 cal/g
  return Math.round(protein * 4 + fat * 9 + carbs * 4);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}
