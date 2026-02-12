import { IncidentRepository } from '../services/incidentRepository.js';
import { IncidentComment } from '../types/incident.js';

export async function addComment(
    repository: IncidentRepository,
    data: {
        incidentId: string;
        commentText: string;
        createdBy: string;
    }
): Promise<{ statusCode: number; body: IncidentComment }> {
    try {
        if (!data.incidentId) {
            return {
                statusCode: 400,
                body: { error: 'Incident ID is required' } as any
            };
        }

        if (!data.commentText || data.commentText.trim().length === 0) {
            return {
                statusCode: 400,
                body: { error: 'Comment text is required' } as any
            };
        }

        if (!data.createdBy) {
            return {
                statusCode: 400,
                body: { error: 'createdBy is required' } as any
            };
        }

        const incident = await repository.getIncidentById(data.incidentId);
        if (!incident) {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' } as any
            };
        }

        const comment = await repository.addComment({
            incidentId: data.incidentId,
            commentText: data.commentText.trim(),
            createdBy: data.createdBy
        });

        console.log('Comment added:', {
            incidentId: data.incidentId,
            commentId: comment.commentId,
            createdBy: data.createdBy
        });

        return {
            statusCode: 201,
            body: comment
        };
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to add comment' } as any
        };
    }
}