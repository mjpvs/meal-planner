'use client';

import { useState, useEffect } from 'react';
import { Meal } from '@/lib/types';
import { apiPath } from '@/lib/api';

export default function MealsPage() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newIngredients, setNewIngredients] = useState('');
    const [editName, setEditName] = useState('');
    const [editIngredients, setEditIngredients] = useState('');

    useEffect(() => {
        fetchMeals();
    }, []);

    async function fetchMeals() {
        const res = await fetch(apiPath('meals'));
        const data = await res.json();
        setMeals(data);
        setLoading(false);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;

        const ingredients = newIngredients
            .split(',')
            .map((i) => i.trim())
            .filter((i) => i);

        const res = await fetch(apiPath('meals'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, ingredients }),
        });

        if (res.ok) {
            const meal = await res.json();
            setMeals([...meals, meal]);
            setNewName('');
            setNewIngredients('');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this meal?')) return;

        const res = await fetch(apiPath(`meals/${id}`), { method: 'DELETE' });
        if (res.ok) {
            setMeals(meals.filter((m) => m.id !== id));
        }
    }

    function startEdit(meal: Meal) {
        setEditingId(meal.id);
        setEditName(meal.name);
        setEditIngredients(meal.ingredients.join(', '));
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName('');
        setEditIngredients('');
    }

    async function handleSaveEdit(id: string) {
        const ingredients = editIngredients
            .split(',')
            .map((i) => i.trim())
            .filter((i) => i);

        const res = await fetch(apiPath(`meals/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName, ingredients }),
        });

        if (res.ok) {
            const updated = await res.json();
            setMeals(meals.map((m) => (m.id === id ? updated : m)));
            cancelEdit();
        }
    }

    if (loading) {
        return <div className="card">Loading...</div>;
    }

    return (
        <>
            <div className="header-row">
                <h1>Meals</h1>
            </div>

            <div className="card">
                <h2>Add New Meal</h2>
                <form onSubmit={handleAdd}>
                    <div className="form-group">
                        <label htmlFor="name">Meal Name</label>
                        <input
                            type="text"
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g., Spaghetti Bolognese"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ingredients">Ingredients (comma-separated)</label>
                        <input
                            type="text"
                            id="ingredients"
                            value={newIngredients}
                            onChange={(e) => setNewIngredients(e.target.value)}
                            placeholder="e.g., pasta, beef, tomato sauce"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Add Meal
                    </button>
                </form>
            </div>

            <div className="card">
                <h2>Your Meals</h2>
                {meals.length === 0 ? (
                    <div className="empty-state">
                        No meals yet. Add your first meal above.
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Ingredients</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meals.map((meal) => (
                                <tr key={meal.id}>
                                    {editingId === meal.id ? (
                                        <>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editIngredients}
                                                    onChange={(e) => setEditIngredients(e.target.value)}
                                                />
                                            </td>
                                            <td className="actions">
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleSaveEdit(meal.id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{meal.name}</td>
                                            <td>{meal.ingredients.join(', ') || '-'}</td>
                                            <td className="actions">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => startEdit(meal)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(meal.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
