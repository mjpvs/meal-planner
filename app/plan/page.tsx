'use client';

import { useState, useEffect, useCallback } from 'react';
import { Meal, DayPlan } from '@/lib/types';
import { apiPath } from '@/lib/api';
import { getCurrentWeekInfo, getNextWeekInfo } from '@/lib/dates';

interface DayPlanWithMeal extends DayPlan {
    meal: Meal | null;
}

interface PlanWithMeals {
    weekNumber: number;
    year: number;
    dates: string[];
    days: DayPlanWithMeal[];
}

interface ApiResponse {
    currentPlan: PlanWithMeals | null;
    nextPlan: PlanWithMeals | null;
    message?: string;
}

export default function PlanPage() {
    const [currentPlan, setCurrentPlan] = useState<PlanWithMeals | null>(null);
    const [nextPlan, setNextPlan] = useState<PlanWithMeals | null>(null);
    const [allMeals, setAllMeals] = useState<Meal[]>([]);
    const [viewingNextWeek, setViewingNextWeek] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState('');
    const [editingDay, setEditingDay] = useState<string | null>(null);

    const fetchPlan = useCallback(async () => {
        const res = await fetch(apiPath('plan'));
        const data: ApiResponse = await res.json();
        setCurrentPlan(data.currentPlan);
        setNextPlan(data.nextPlan);
        setMessage(data.message || '');
        setViewingNextWeek(false);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPlan();
        fetchMeals();
    }, [fetchPlan]);

    async function fetchMeals() {
        const res = await fetch(apiPath('meals'));
        const data = await res.json();
        setAllMeals(data.meals || []);
    }

    async function regeneratePlan() {
        setGenerating(true);
        const res = await fetch(apiPath('plan'), { method: 'POST' });
        const data: ApiResponse = await res.json();
        setCurrentPlan(data.currentPlan);
        setNextPlan(data.nextPlan);
        setMessage('');
        setViewingNextWeek(false);
        setGenerating(false);
    }

    async function updateDayMeal(day: string, mealId: string) {
        const res = await fetch(apiPath('plan'), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ day, mealId }),
        });
        const data: ApiResponse = await res.json();
        setCurrentPlan(data.currentPlan);
        setNextPlan(data.nextPlan);
        setEditingDay(null);
    }

    function formatDayName(day: string): string {
        return day.charAt(0).toUpperCase() + day.slice(1);
    }

    function getWeekLabel(plan: PlanWithMeals): string {
        return `Week ${plan.weekNumber}`;
    }

    function getDateRange(plan: PlanWithMeals): string {
        const startDate = plan.dates[0];
        const endDate = plan.dates[6];
        return `${startDate} - ${endDate}, ${plan.year}`;
    }

    const currentWeekInfo = getCurrentWeekInfo();
    const isCurrentWeek = currentPlan?.weekNumber === currentWeekInfo.weekNumber && currentPlan?.year === currentWeekInfo.year;
    const activePlan = viewingNextWeek ? nextPlan : currentPlan;

    if (loading) {
        return <div className="card">Loading...</div>;
    }

    return (
        <>
            <div className="header-row">
                <h1>Weekly Meal Plan</h1>
                <button
                    className="btn btn-primary"
                    onClick={regeneratePlan}
                    disabled={generating}
                >
                    {generating ? 'Generating...' : 'Regenerate Plan'}
                </button>
            </div>

            {message && (
                <div className="card" style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107' }}>
                    {message}
                </div>
            )}

            {!currentPlan && !nextPlan ? (
                <div className="card">
                    <div className="empty-state">
                        No meal plan available. Add some meals first, then regenerate the plan.
                    </div>
                </div>
            ) : (
                <>
                    {isCurrentWeek && nextPlan && (
                        <div className="week-nav">
                            <button
                                className={`btn btn-secondary ${!viewingNextWeek ? 'active' : ''}`}
                                onClick={() => setViewingNextWeek(false)}
                            >
                                This Week
                            </button>
                            <button
                                className={`btn btn-secondary ${viewingNextWeek ? 'active' : ''}`}
                                onClick={() => setViewingNextWeek(true)}
                            >
                                Next Week
                            </button>
                        </div>
                    )}

                    {activePlan && (
                        <div className="card">
                            <div className="week-header">
                                <span className="week-label">{getWeekLabel(activePlan)}</span>
                                <span className="week-dates">{getDateRange(activePlan)}</span>
                            </div>
                            {activePlan.days.map((day, index) => (
                                <div key={day.day} className="day-plan">
                                    <div className="day-info">
                                        <span className="day-name">{formatDayName(day.day)}</span>
                                        <span className="day-date">{activePlan.dates[index]}</span>
                                    </div>
                                    <div className="day-meal">
                                        {editingDay === day.day ? (
                                            <div className="meal-edit">
                                                <select
                                                    value={day.meal?.id || ''}
                                                    onChange={(e) => updateDayMeal(day.day, e.target.value)}
                                                    className="meal-select"
                                                >
                                                    <option value="">No meal</option>
                                                    {allMeals.map((meal) => (
                                                        <option key={meal.id} value={meal.id}>
                                                            {meal.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => setEditingDay(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="meal-display">
                                                {day.meal ? (
                                                    <div className="meal-name">
                                                        <div>{day.meal.name}</div>
                                                        {day.meal.ingredients.length > 0 && (
                                                            <div className="meal-ingredients">
                                                                {day.meal.ingredients.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#999' }}>No meal assigned</span>
                                                )}
                                                <button
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => setEditingDay(day.day)}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
