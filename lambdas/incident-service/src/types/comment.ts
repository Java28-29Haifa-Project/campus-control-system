export interface IncidentComment {
    commentId: string;
    incidentId: string;
    commentText: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddCommentInput {
    incidentId: string;
    commentText: string;
    createdBy: string;
}