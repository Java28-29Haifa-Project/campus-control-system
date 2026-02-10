import {IncidentStatus} from "../types/incidentTypes.ts";

export function buildStatusOptionsForRow(
    current: IncidentStatus,
    roleOptions: IncidentStatus[]
) {
    return roleOptions.includes(current)
        ? roleOptions
        : [current, ...roleOptions];
}

const ALLOWED_NEXT: Record<IncidentStatus, IncidentStatus[]> = {
    [IncidentStatus.New]: [IncidentStatus.Assign],
    [IncidentStatus.Assign]: [IncidentStatus.InProgress],
    [IncidentStatus.InProgress]: [IncidentStatus.Resolved],
    [IncidentStatus.Resolved]: [IncidentStatus.Closed],
    [IncidentStatus.Closed]: [],
};

export function canMoveIncident(from: IncidentStatus, to: IncidentStatus) {
    return ALLOWED_NEXT[from]?.includes(to) ?? false;
}
export function isOptionDisabled(
    current: IncidentStatus,
    option: IncidentStatus,
    roleOptions: IncidentStatus[]
) {
    if (option === current) return false;

    if (!roleOptions.includes(option)) return true;

    return !canMoveIncident(current, option);
}
