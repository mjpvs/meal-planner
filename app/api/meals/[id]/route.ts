import { NextResponse } from 'next/server';
import { getMeals, saveMeals } from '@/lib/data';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const meals = getMeals();
    const meal = meals.find((m) => m.id === id);

    if (!meal) {
        return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json(meal);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { name, ingredients } = body;
    const meals = getMeals();
    const index = meals.findIndex((m) => m.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    meals[index] = {
        ...meals[index],
        name: name?.trim() ?? meals[index].name,
        ingredients: Array.isArray(ingredients) 
            ? ingredients.filter((i: unknown) => typeof i === 'string').map((i: string) => i.trim())
            : meals[index].ingredients,
    };

    saveMeals(meals);
    return NextResponse.json(meals[index]);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const meals = getMeals();
    const index = meals.findIndex((m) => m.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    meals.splice(index, 1);
    saveMeals(meals);

    return NextResponse.json({ success: true });
}
