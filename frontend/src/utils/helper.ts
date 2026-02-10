import {IncidentStatus} from "../types/incidentTypes.ts";


const ALLOWED_NEXT: Record<IncidentStatus, IncidentStatus[]> = {
    [IncidentStatus.Open]: [IncidentStatus.Assign],
    [IncidentStatus.Assign]: [IncidentStatus.InProgress],
    [IncidentStatus.InProgress]: [IncidentStatus.Resolved],
    [IncidentStatus.Resolved]: [IncidentStatus.Closed],
    [IncidentStatus.Closed]: [],
};

export function canMoveIncident(from: IncidentStatus, to: IncidentStatus) {
    return ALLOWED_NEXT[from]?.includes(to) ?? false;
}
export function isOptionDisabled(current: IncidentStatus, option: IncidentStatus) {
    if (option === current) return false;
    return !canMoveIncident(current, option);
}