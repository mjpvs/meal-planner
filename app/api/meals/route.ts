import { NextResponse } from 'next/server';
import { getMeals, saveMeals } from '@/lib/data';
import { Meal } from '@/lib/types';

export async function GET() {
    const meals = getMeals();
    return NextResponse.json(meals);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, ingredients } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const meals = getMeals();
    const newMeal: Meal = {
        id: crypto.randomUUID(),
        name: name.trim(),
        ingredients: Array.isArray(ingredients) ? ingredients.filter((i: unknown) => typeof i === 'string').map((i: string) => i.trim()) : [],
    };

    meals.push(newMeal);
    saveMeals(meals);

    return NextResponse.json(newMeal, { status: 201 });
}
