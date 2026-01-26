
export const validateTicketForm = (subject: string, description: string): string | null => {
    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    if(!trimmedSubject)
        return "Subject is required";
    if(trimmedSubject.length < 10)
        return "Subject must be at least 10 characters";
    if(trimmedSubject.length > 100)
        return "Subject must be less than 1000 characters";

    if(!trimmedDescription)
        return "Description is required";
    if (trimmedDescription.length < 10) {
        return "Description must be at least 10 characters long";
    }
    if (trimmedDescription.length > 2000) {
        return "Description must be less than 2000 characters";
    }

    return null;

}