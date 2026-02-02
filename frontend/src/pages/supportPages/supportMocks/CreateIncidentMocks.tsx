
import React, {type FormEvent, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import { useAppDispatch} from "../../../state/hooks";
import { createIncidentThunk } from "../../../state/slices/incidentSlice";
import { IncidentImpact, IncidentUrgencies } from "../../../types/incidentTypes";
import '../../../styles/tables.css';
import '../../../styles/forms.css'
import {type MockTicket, mockTickets} from "../../../mocks/ticketMocks.ts";


const CreateIncidentMock: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const getTicketByIdMock = (id: string): MockTicket => {
        const t = mockTickets.filter(t => t.requestId === id);
        return t[0];
    };
    const ticket = getTicketByIdMock(ticketId!);

    const [impact, setImpact] = useState<IncidentImpact | "">("");
    const [urgency, setUrgency] = useState<IncidentUrgencies | "">("");
    // const [description, setDescription] = useState<string>(ticket?.description ?? "");

    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!ticketId) {
        return (
            <div className="auth-page">
                <div className="ticket-form-wrapper">
                    <h2>Ticket not provided</h2>
                    <p>Open incident creation from ticket details page.</p>

                    <div className="ticket-form-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/support/ticket")}
                        >
                            ← Back to tickets
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const resetForm = () => {
        setImpact("");
        setUrgency("");
        // setDescription(ticket.description ?? "");
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // простая валидация
        if (!impact || !urgency) return;

        const resultAction = await dispatch(
            createIncidentThunk({
                ticketIds: [ticketId],
                impact,
                urgency,
                category: ticket.category,
                // description: description.trim(),
                description: ticket.description,
            })
        );

        if (createIncidentThunk.fulfilled.match(resultAction)) {
            setIsSubmitted(true);
            resetForm();
        } else {
            console.error("creation incident failed");
        }
    };

    if (isSubmitted) {
        return (
            <div className="auth-page">
                <div className="login-wrapper ticket-form-wrapper success-state">
                    <div className="success-check">✓</div>
                    <h2>Incident created</h2>
                    <p>Incident has been successfully submitted!</p>

                    <div className="ticket-form-actions">
                        <button type="button" onClick={() => navigate("/incident")}>
                            Go to incidents
                        </button>

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/support/ticket")}
                        >
                            Back to tickets
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="support-form-page details">
                <h1>Create incident</h1>

                <div className="mini-details">
                    <div><b>Ticket ID:</b> {ticket.requestId}</div>
                    <div><b>Subject:</b> {ticket.subject}</div>
                    <div><b>Priority:</b> {ticket.userReportedPriority}</div>
                    <div><b>Status:</b> {ticket.status}</div>
                    <div><b>Category:</b> {ticket.category}</div>
                    <div ><b>Description:</b> {ticket.description}</div>
                </div>

                <form onSubmit={onSubmit}>
            {/*        <div className="textarea-box">*/}
            {/*<textarea*/}
            {/*    placeholder="Describe incident..."*/}
            {/*    value={description}*/}
            {/*    onChange={(e) => setDescription(e.target.value)}*/}
            {/*/>*/}
            {/*        </div>*/}

                    <div className="select-box">
                        <select
                            value={impact}
                            onChange={(e) => setImpact(e.target.value as IncidentImpact | "")}
                            required
                        >
                            <option value="" disabled>
                                Select impact…
                            </option>
                            <option value={IncidentImpact.Low}>Low</option>
                            <option value={IncidentImpact.Medium}>Medium</option>
                            <option value={IncidentImpact.High}>High</option>
                        </select>
                    </div>

                    <div className="select-box">
                        <select
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value as IncidentUrgencies | "")}
                            required
                        >
                            <option value="" disabled>
                                Select urgency…
                            </option>
                            <option value={IncidentUrgencies.Low}>Low</option>
                            <option value={IncidentUrgencies.Medium}>Medium</option>
                            <option value={IncidentUrgencies.High}>High</option>
                        </select>
                    </div>

                    <div className="ticket-form-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/support/ticket")}
                        >
                            Cancel
                        </button>

                        <button
                            className="secondary-btn"
                            style={{ background: "#797537" }}
                            type="submit"
                        >
                            Create Incident
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIncidentMock;
