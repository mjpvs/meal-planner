import { MealPlan } from './types';

const DATA_DIR = 'data';
const PLAN_FILE = 'plan.json';

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

export function getPlan(): MealPlan | null {
    const fs = require('fs');
    const filePath = getFilePath(PLAN_FILE);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function savePlan(plan: MealPlan): void {
    const fs = require('fs');
    ensureDataDir();
    const filePath = getFilePath(PLAN_FILE);
    fs.writeFileSync(filePath, JSON.stringify(plan, null, 4), 'utf8');
}
