import { NextResponse } from 'next/server';
import { getMeals } from '@/lib/data';
import { getPlan, savePlan } from '@/lib/planData';
import { generateWeeklyPlan, getCurrentWeekInfo, isPlanStale } from '@/lib/planner';
import { MealPlan } from '@/lib/types';

export async function GET() {
    let plan = getPlan();

    if (!plan || isPlanStale(plan)) {
        const meals = getMeals();
        if (meals.length === 0) {
            return NextResponse.json({ plan: null, message: 'No meals available' }, { status: 200 });
        }

        const previousLastMealId = plan?.days?.[6]?.mealId;
        const days = generateWeeklyPlan(meals, previousLastMealId);
        const { weekNumber, year } = getCurrentWeekInfo();

        plan = { weekNumber, year, days };
        savePlan(plan);
    }

    const meals = getMeals();
    const planWithMeals = {
        ...plan,
        days: plan.days.map((day) => ({
            ...day,
            meal: meals.find((m) => m.id === day.mealId) || null,
        })),
    };

    return NextResponse.json({ plan: planWithMeals });
}

export async function POST() {
    const meals = getMeals();
    
    if (meals.length === 0) {
        return NextResponse.json({ error: 'No meals available' }, { status: 400 });
    }

    const plan = getPlan();
    const previousLastMealId = plan?.days?.[6]?.mealId;
    const days = generateWeeklyPlan(meals, previousLastMealId);
    const { weekNumber, year } = getCurrentWeekInfo();

    const newPlan: MealPlan = { weekNumber, year, days };
    savePlan(newPlan);

    const planWithMeals = {
        ...newPlan,
        days: newPlan.days.map((day) => ({
            ...day,
            meal: meals.find((m) => m.id === day.mealId) || null,
        })),
    };

    return NextResponse.json({ plan: planWithMeals });
}
