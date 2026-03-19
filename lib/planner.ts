import { Meal, DayPlan, DAYS_OF_WEEK } from './types';

export function generateWeeklyPlan(
    meals: Meal[],
    previousWeekLastMealId?: string
): DayPlan[] {
    const availableMeals = meals.filter(
        (meal) => meal.id !== previousWeekLastMealId
    );

    if (availableMeals.length < 7) {
        const shuffled = shuffleArray([...meals]);
        return DAYS_OF_WEEK.map((day, index) => ({
            day,
            mealId: shuffled[index % shuffled.length].id,
        }));
    }

    const shuffled = shuffleArray(availableMeals);
    return DAYS_OF_WEEK.map((day, index) => ({
        day,
        mealId: shuffled[index].id,
    }));
}

function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function getCurrentWeekInfo(): { weekNumber: number; year: number } {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor(
        (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return { weekNumber, year: now.getFullYear() };
}

export function isPlanStale(plan: { weekNumber: number; year: number }): boolean {
    const { weekNumber, year } = getCurrentWeekInfo();
    return plan.weekNumber !== weekNumber || plan.year !== year;
}
