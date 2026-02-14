import {IncidentPriority, IncidentStatus} from "../types/incidentTypes.ts";


export function canMoveByRank<T extends string | number>(
    order: Record<T, number>,
    current: T,
    next: T,
) {
    const c = order[current];
    const n = order[next];

    if (c === undefined || n === undefined) return false;
    if (n === c) return false;

    return n > c ;
}

export function isOptionDisabledByRank<T extends string | number>(
    order: Record<T, number>,
    current: T,
    option: T,
) {
    if (option === current) return false;
    return !canMoveByRank(order, current, option);
}
export const INCIDENT_STATUS_ORDER: Record<IncidentStatus, number> = {
    [IncidentStatus.New]: 0,
    [IncidentStatus.Assign]: 1,
    [IncidentStatus.InProgress]: 2,
    [IncidentStatus.Resolved]: 3,
    [IncidentStatus.Closed]: 4,
};
export const INCIDENT_PRIORITY_ORDER: Record<IncidentPriority, number> = {
    [IncidentPriority.P1]: 0,
    [IncidentPriority.P2]: 1,
    [IncidentPriority.P3]: 2,
    [IncidentPriority.P4]: 3,
};

