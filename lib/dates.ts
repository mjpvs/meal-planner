import { DAYS_OF_WEEK } from './types';

export interface WeekInfo {
    weekNumber: number;
    year: number;
    startDate: Date;
    endDate: Date;
    dates: Date[];
}

export function getWeekInfo(weekNumber: number, year: number): WeekInfo {
    const startDate = getDateForWeek(weekNumber, year);
    const dates = DAYS_OF_WEEK.map((_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });
    const endDate = new Date(dates[6]);

    return {
        weekNumber,
        year,
        startDate,
        endDate,
        dates,
    };
}

export function getDateForWeek(weekNumber: number, year: number): Date {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const isoWeekStart = simple;
    if (dow <= 4) {
        isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return isoWeekStart;
}

export function getCurrentWeekInfo(): WeekInfo {
    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = getISOWeekNumber(now);
    return getWeekInfo(weekNumber, year);
}

export function getISOWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getNextWeekInfo(weekNumber: number, year: number): { weekNumber: number; year: number } {
    if (weekNumber >= 52) {
        const nextYearWeeks = getISOWeekNumber(new Date(year + 1, 11, 28));
        if (nextYearWeeks === 1) {
            return { weekNumber: 1, year: year + 1 };
        }
        return { weekNumber: weekNumber + 1, year };
    }
    return { weekNumber: weekNumber + 1, year };
}

export function formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatDateRange(start: Date, end: Date): string {
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    return `${startStr} - ${endStr}, ${end.getFullYear()}`;
}
