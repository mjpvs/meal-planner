'use client';

import { useState, useEffect } from 'react';
import { Meal, DayPlan } from '@/lib/types';
import { apiPath } from '@/lib/api';

interface DayPlanWithMeal extends DayPlan {
    meal: Meal | null;
}

interface PlanResponse {
    plan: {
        weekNumber: number;
        year: number;
        days: DayPlanWithMeal[];
    } | null;
    message?: string;
}

export default function PlanPage() {
    const [planData, setPlanData] = useState<PlanResponse['plan']>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPlan();
    }, []);

    async function fetchPlan() {
        const res = await fetch(apiPath('plan'));
        const data: PlanResponse = await res.json();
        setPlanData(data.plan);
        setMessage(data.message || '');
        setLoading(false);
    }

    async function regeneratePlan() {
        setGenerating(true);
        const res = await fetch(apiPath('plan'), { method: 'POST' });
        const data: PlanResponse = await res.json();
        setPlanData(data.plan);
        setGenerating(false);
    }

    function formatDayName(day: string): string {
        return day.charAt(0).toUpperCase() + day.slice(1);
    }

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

            {!planData ? (
                <div className="card">
                    <div className="empty-state">
                        No meal plan available. Add some meals first, then regenerate the plan.
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div style={{ marginBottom: '1rem', color: '#777' }}>
                        Week {planData.weekNumber}, {planData.year}
                    </div>
                    {planData.days.map((day) => (
                        <div key={day.day} className="day-plan">
                            <span className="day-name">{formatDayName(day.day)}</span>
                            <div className="meal-name">
                                {day.meal ? (
                                    <>
                                        <div>{day.meal.name}</div>
                                        {day.meal.ingredients.length > 0 && (
                                            <div className="meal-ingredients">
                                                {day.meal.ingredients.join(', ')}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span style={{ color: '#999' }}>No meal assigned</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
