import { NextResponse } from 'next/server';
import { getMeals } from '@/lib/data';
import { getPlan, savePlan } from '@/lib/planData';
import { generateWeeklyPlan } from '@/lib/planner';
import { getCurrentWeekInfo, getWeekInfo, getNextWeekInfo, formatDate } from '@/lib/dates';
import type { MealPlan } from '@/lib/types';

interface PlanWithMeals {
    weekNumber: number;
    year: number;
    dates: string[];
    days: (import('@/lib/types').DayPlan & { meal: import('@/lib/types').Meal | null })[];
}

interface PlanResponse {
    currentPlan: PlanWithMeals | null;
    nextPlan: PlanWithMeals | null;
    message?: string;
}

function enrichPlanWithMeals(plan: MealPlan): PlanWithMeals {
    const meals = getMeals();
    const weekInfo = getWeekInfo(plan.weekNumber, plan.year);
    return {
        ...plan,
        dates: weekInfo.dates.map((d) => formatDate(d)),
        days: plan.days.map((day) => ({
            ...day,
            meal: meals.find((m) => m.id === day.mealId) || null,
        })),
    };
}

function ensurePlanForWeek(weekNumber: number, year: number): MealPlan | null {
    const meals = getMeals();
    if (meals.length === 0) {
        return null;
    }

    const existingPlan = getPlan();
    if (existingPlan && existingPlan.weekNumber === weekNumber && existingPlan.year === year) {
        return existingPlan;
    }

    let previousLastMealId: string | undefined;
    if (existingPlan) {
        previousLastMealId = existingPlan.days?.[6]?.mealId;
    }

    const days = generateWeeklyPlan(meals, previousLastMealId);
    return { weekNumber, year, days };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    const yearParam = searchParams.get('year');

    const currentWeekInfo = getCurrentWeekInfo();
    const currentWeek = weekParam ? parseInt(weekParam) : currentWeekInfo.weekNumber;
    const currentYear = yearParam ? parseInt(yearParam) : currentWeekInfo.year;

    const plan = ensurePlanForWeek(currentWeek, currentYear);

    if (!plan) {
        return NextResponse.json({ currentPlan: null, nextPlan: null, message: 'No meals available' }, { status: 200 });
    }

    const currentPlanWithMeals = enrichPlanWithMeals(plan);

    let nextPlanWithMeals: PlanWithMeals | null = null;
    if (currentWeek === currentWeekInfo.weekNumber && currentYear === currentWeekInfo.year) {
        const nextWeekInfo = getNextWeekInfo(currentWeek, currentYear);
        const nextPlan = ensurePlanForWeek(nextWeekInfo.weekNumber, nextWeekInfo.year);
        if (nextPlan) {
            nextPlanWithMeals = enrichPlanWithMeals(nextPlan);
        }
    }

    const isStale = currentWeek !== currentWeekInfo.weekNumber || currentYear !== currentWeekInfo.year;
    const message = isStale ? null : currentPlanWithMeals.days.every(d => !d.meal) ? 'No meals available. Add some meals first, then regenerate the plan.' : undefined;

    return NextResponse.json({ currentPlan: currentPlanWithMeals, nextPlan: nextPlanWithMeals, message }, { status: 200 });
}

export async function POST() {
    const meals = getMeals();
    
    if (meals.length === 0) {
        return NextResponse.json({ error: 'No meals available' }, { status: 400 });
    }

    const plan = getPlan();
    const previousLastMealId = plan?.days?.[6]?.mealId;
    const days = generateWeeklyPlan(meals, previousLastMealId);
    const currentWeekInfo = getCurrentWeekInfo();

    const newPlan: MealPlan = { weekNumber: currentWeekInfo.weekNumber, year: currentWeekInfo.year, days };
    savePlan(newPlan);

    const currentPlanWithMeals = enrichPlanWithMeals(newPlan);

    let nextPlanWithMeals: PlanWithMeals | null = null;
    const nextWeekInfo = getNextWeekInfo(currentWeekInfo.weekNumber, currentWeekInfo.year);
    const nextPlan = ensurePlanForWeek(nextWeekInfo.weekNumber, nextWeekInfo.year);
    if (nextPlan) {
        nextPlanWithMeals = enrichPlanWithMeals(nextPlan);
    }

    return NextResponse.json({ currentPlan: currentPlanWithMeals, nextPlan: nextPlanWithMeals }, { status: 200 });
}

export async function PATCH(request: Request) {
    const body = await request.json();
    const { day, mealId } = body as { day: string; mealId: string | null };

    if (!day) {
        return NextResponse.json({ error: 'Day is required' }, { status: 400 });
    }

    const plan = getPlan();
    if (!plan) {
        return NextResponse.json({ error: 'No plan exists' }, { status: 404 });
    }

    const dayIndex = plan.days.findIndex((d) => d.day === day);
    if (dayIndex === -1) {
        return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
    }

    plan.days[dayIndex].mealId = mealId || '';
    savePlan(plan);

    const currentPlanWithMeals = enrichPlanWithMeals(plan);

    let nextPlanWithMeals: PlanWithMeals | null = null;
    const currentWeekInfo = getCurrentWeekInfo();
    if (plan.weekNumber === currentWeekInfo.weekNumber && plan.year === currentWeekInfo.year) {
        const nextWeekInfo = getNextWeekInfo(currentWeekInfo.weekNumber, currentWeekInfo.year);
        const nextPlan = ensurePlanForWeek(nextWeekInfo.weekNumber, nextWeekInfo.year);
        if (nextPlan) {
            nextPlanWithMeals = enrichPlanWithMeals(nextPlan);
        }
    }

    return NextResponse.json({ currentPlan: currentPlanWithMeals, nextPlan: nextPlanWithMeals }, { status: 200 });
}
