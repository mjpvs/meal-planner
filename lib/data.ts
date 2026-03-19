import { Meal } from './types';

const DATA_DIR = 'data';
const MEALS_FILE = 'meals.json';

function getFilePath(fileName: string): string {
    const path = require('path');
    return path.join(process.cwd(), DATA_DIR, fileName);
}

function ensureDataDir(): void {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), DATA_DIR);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function getMeals(): Meal[] {
    const fs = require('fs');
    const filePath = getFilePath(MEALS_FILE);

    if (!fs.existsSync(filePath)) {
        return [];
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data.meals || [];
}

export function saveMeals(meals: Meal[]): void {
    const fs = require('fs');
    ensureDataDir();
    const filePath = getFilePath(MEALS_FILE);
    fs.writeFileSync(filePath, JSON.stringify({ meals }, null, 4), 'utf8');
}
