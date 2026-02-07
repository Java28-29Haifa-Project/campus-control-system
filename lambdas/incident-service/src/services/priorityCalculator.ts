import { Impact, Urgency } from '../types/incident.js';

/**
 * Priority Matrix: Calculates priority (1-4) from Impact and Urgency
 * 
 * Priority 1 = Highest (Critical/High incidents)
 * Priority 4 = Lowest
 */
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

/**
 * Validate if new priority is a valid raise (can only go 4→3→2→1, not down)
 */
export function canRaisePriority(currentPriority: number, newPriority: number): boolean {
    // Must be raising (lower number = higher priority)
    if (newPriority >= currentPriority) {
        return false;
    }

    // Must be valid priority (1-4)
    if (newPriority < 1 || newPriority > 4) {
        return false;
    }

    return true;
}
