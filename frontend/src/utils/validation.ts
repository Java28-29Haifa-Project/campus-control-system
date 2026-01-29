import type {LoginRequest} from "../types/authTypes.ts";

export const validateLogin = (data: LoginRequest): string | null => {
    const trimmedEmail = data.email.trim();
    const trimmedPassword = data.password.trim();

    const emailRegex = /^[^\s+@]+@[^\s+@]+\.[^\s+@]+$/;
    const passwordLetterRegex = /[A-Za-z]/;
    const passwordDigitRegex = /\d/;

    if(!trimmedEmail) return "Email is required";
    if(!emailRegex.test(trimmedEmail)) return "Enter a valid email. Email must contain symbol '@'. Example:user@abc.com";

    if(!trimmedPassword) return "Password is required";
    if(trimmedPassword.length < 8) return "Password must be at least 8 characters";
    if(!passwordLetterRegex.test(trimmedPassword)) return "Password must have at least one letter";
    if(!passwordDigitRegex.test(trimmedPassword)) return "Password must have at least one digit";

    return null;
}
export const validateName = (name: string) : string | null => {
    const trimmedName = name.trim();

    if(!trimmedName) return "Name is required";
    if(trimmedName.length < 2)
        return "Name must be at least 2 characters";
    if(trimmedName.length > 30)
        return "Name must be less than 30 characters";
    return null;
}



export const validateTicketForm = (subject:string, description:string, category:string, priority:string): string | null => {
    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    if(!trimmedSubject)
        return "Title is required";
    if(trimmedSubject.length < 5)
        return "Title must be at least 5 characters";
    if(trimmedSubject.length > 20)
        return "Title must be less than 20 characters";

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