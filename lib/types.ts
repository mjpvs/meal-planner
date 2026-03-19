export interface Meal {
    id: string;
    name: string;
    ingredients: string[];
}

export interface DayPlan {
    day: string;
    mealId: string;
}

export interface MealPlan {
    weekNumber: number;
    year: number;
    days: DayPlan[];
    dates?: string[];
}

export type DaysOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: DaysOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];
