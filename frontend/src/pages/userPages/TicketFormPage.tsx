import React, { useState, type FormEvent } from "react";
import './../../styles/forms.css';
import { useNavigate } from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {createTicketThunk} from "../../state/slices/ticketSlice.ts";
import {Category, UserPriority} from "../../types/ticketTypes.ts";
import {validateTicketForm} from "../../utils/validation.ts";

const TICKET_CATEGORY:Category[] = [
    Category.Plumbing,
    Category.Gas,
    Category.Electrical,
    Category.Elevatory,
    Category.Access,
    Category.Hvac,
    Category.Fire_safety,
    Category.Infrastructure,
    Category.Network,
    Category.Other,
]

const TicketFormPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { isCreating, error } = useAppSelector((state) => state.ticket);

    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<Category | "">("");
    const [priority, setPriority] = useState<UserPriority | "">("");

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const resetForm = () => {
        setSubject("");
        setDescription("");
        setCategory("");
        setPriority("");
        setValidationError(null);
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validationMessage = validateTicketForm(subject, description, category, priority);
        if(validationMessage) {
            setValidationError(validationMessage);
            return;
        }
        setValidationError(null);

        try {
            const resultAction = await dispatch(
                createTicketThunk({
                    subject,
                    description,
                    category: category as Category,
                    userReportedPriority: priority as UserPriority
                })
            );

            if (createTicketThunk.fulfilled.match(resultAction)) {
                setIsSubmitted(true);
                resetForm();
            } else {
                console.error("creation ticket failed");
            }
        } catch (err) {
            console.error("error - creation ticket failed", err);
        }
    };

    if (isSubmitted) {
        return (
            <div className="auth-page">
                <div className="login-wrapper ticket-form-wrapper success-state">
                    <div className="success-check">✓</div>
                    <h2>Ticket created</h2>
                    <p>Your ticket has been successfully submitted.</p>

                    <div className="ticket-form-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => {
                                setIsSubmitted(false);
                                navigate("/ticket/new", { replace: true })
                            }}
                        >
                            Create another
                        </button>
                        <button type="button" onClick={() => {
                            setIsSubmitted(false);
                            console.log("CLICK GO TICKETS");
                            navigate("/ticket", { replace: true })
                        }}>
                            Go to tickets
                        </button>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="ticket-form-wrapper">
                <h1>Create ticket</h1>

                <form onSubmit={onSubmit}>
                    <div className=" title">
                        <input
                            type="text"
                            placeholder="Title"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="textarea-box">
                        <textarea
                            placeholder="Describe your issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className=" select-box">
                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value as Category | "")
                            }
                        >
                            <option value="" disabled>
                                Select category…
                            </option>
                            {TICKET_CATEGORY.map((category) => (
                                <option key={category} value={category}>{category.replace("_", " ")}</option>
                            ))}
                        </select>
                    </div>

                    <div className="select-box">
                        <select
                            value={priority}
                            onChange={(e) =>
                                setPriority(e.target.value as UserPriority | "")
                            }
                        >
                            <option value="" disabled>
                                Select priority…
                            </option>
                            <option value={UserPriority.Low}>Low</option>
                            <option value={UserPriority.Medium}>Medium</option>
                            <option value={UserPriority.High}>High</option>
                            <option value={UserPriority.Urgent}>Urgent</option>
                        </select>
                    </div>

                    {validationError && (
                        <div className="error-message">
                            {validationError}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            Error: {error}
                        </div>
                    )}

                    <div className="ticket-form-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/ticket")}
                            disabled={isCreating}
                        >
                            Cancel
                        </button>

                        <button className="secondary-btn" style={{"background":"#797537"}} type="submit" disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default TicketFormPage;
