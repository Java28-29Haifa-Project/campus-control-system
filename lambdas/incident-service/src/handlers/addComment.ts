import { IncidentRepository } from '../services/incidentRepository.js';

export async function addComment(
    repository: IncidentRepository,
    data: { incidentId: string; commentText: string; createdBy: string }
): Promise<{ statusCode: number; body: any }> {
    try {
        if (!data.commentText || data.commentText.trim().length === 0) {
            return {
                statusCode: 400,
                body: { error: 'Comment text is required' }
            };
        }

        const comment = await repository.addComment(data);

        return {
            statusCode: 201,
            body: comment
        };
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to add comment' }
        };
    }
}