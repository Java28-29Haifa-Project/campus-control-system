
export const validateTicketForm = (subject:string, description:string, category:string, priority:string): string | null => {
    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    if(!trimmedSubject)
        return "Subject is required";
    if(trimmedSubject.length < 5)
        return "Subject must be at least 5 characters";
    if(trimmedSubject.length > 20)
        return "Subject must be less than 20 characters";

    if(!trimmedDescription)
        return "Description is required";
    if (trimmedDescription.length < 10)
        return "Description must be at least 10 characters long";
    if (trimmedDescription.length > 500)
        return "Description must be less than 500 characters";

    if(!category)
        return "Category is required";

    if(!priority)
        return "User reportedPriority is required";

    return null;

}