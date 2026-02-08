import { Impact, Urgency } from '../types/incident.js';

export function calculatePriority(impact: Impact, urgency: Urgency): number {
    const matrix: Record<Impact, Record<Urgency, number>> = {
        critical: {
            high: 1,
            medium: 1,
            low: 1
        },
        high: {
            high: 1,
            medium: 1,
            low: 2
        },
        medium: {
            high: 2,
            medium: 2,
            low: 3
        },
        low: {
            high: 3,
            medium: 3,
            low: 4
        }
    };

    return matrix[impact][urgency];
}

export function canRaisePriority(currentPriority: number, newPriority: number): boolean {
    if (newPriority >= currentPriority) {
        return false;
    }

    if (newPriority < 1 || newPriority > 4) {
        return false;
    }

    return true;
}
