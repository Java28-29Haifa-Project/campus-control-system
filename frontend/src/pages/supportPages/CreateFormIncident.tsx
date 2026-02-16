import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {useNavigate, useParams} from "react-router-dom";
import React, {type FormEvent, useEffect, useState} from "react";
import {IncidentImpact, IncidentUrgencies} from "../../types/incidentTypes.ts";
import {createIncidentThunk, linkIncidentToTicketLocal} from "../../state/slices/incidentSlice.ts";
import {
    clearCurrentTicket,
    fetchTicketByIdThunk,
    fetchTicketsThunk
} from "../../state/slices/ticketSlice.ts";
import "../../styles/tables.css";
import "../../styles/forms.css";

const CreateFormIncident:React.FC = () => {
        const { ticketId } = useParams<{ ticketId: string }>();
        const dispatch = useAppDispatch();
        const navigate = useNavigate();

        const { current, isLoadingCurrent, error } = useAppSelector((state) => state.ticket);
        const { isCreatingInc, errorInc } = useAppSelector((state) => state.incident);

        const [impact, setImpact] = useState<IncidentImpact | "">("");
        const [urgency, setUrgency] = useState<IncidentUrgencies | "">("");
        // const [description, setDescription] = useState<string>(ticket?.description ?? "");
        const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (!ticketId) return;

        dispatch(fetchTicketByIdThunk(ticketId));

        return () => {
            dispatch(clearCurrentTicket());
        };
    }, [dispatch, ticketId]);

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
    if (isLoadingCurrent) {
        return <div>Loading ticket...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!current) {
        return (
            <div className="support-table-page">
                <p>Ticket not found</p>
                <div className="ticket-details-actions">
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={async () => {
                            setIsSubmitted(false);
                            await dispatch(fetchTicketsThunk());
                            navigate("/support/ticket", { replace: true });
                        }}
                    >
                        ← Back to tickets
                    </button>
                </div>
            </div>
        );
    }

    if (current.incidentId) {
        return (
            <div className="auth-page">
                <div className="ticket-form-wrapper">
                    <h2>Incident already exists</h2>
                    <p>Incident: {current.incidentId}</p>

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
            if (!impact || !urgency) return;

            const resultAction = await dispatch(
                createIncidentThunk({
                    ticketIds: [current.requestId],
                    impact,
                    urgency,
                    category: current.category,
                    // description: description.trim(),
                    description: current.description || "",
                })
            );

            if (createIncidentThunk.fulfilled.match(resultAction)) {
                const createdIncident = resultAction.payload;
                const incidentId =
                    createdIncident?.incidentId ?? `MOCK-INC-${Date.now()}`;

                // if (incidentId) {
                //     dispatch(attachIncidentToTicket({ ticketId: current.requestId, incidentId }));
                // }
                dispatch(
                    linkIncidentToTicketLocal({
                        ticketId: current.requestId,
                        incidentId,
                    })
                );

                setIsSubmitted(true);
                resetForm();
            }
        };

        if (isSubmitted) {
            return (
                <div className="auth-page">
                    <div className="login-wrapper ticket-form-wrapper success-state">
                        <div className="success-check">✓</div>
                        <h2>Incident created</h2>
                        <p>Incident has been successfully submitted!</p>

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    console.log("CLICK GO TICKETS");
                                    navigate("/support/ticket", { replace: true })
                                }}
                            >
                                Back to tickets
                            </button>
                        </div>
                    </div>
            );
        }

        return (
            <div className="auth-page">
                <div className="support-form-page details">
                    <h1>Create incident</h1>

                    <div className="mini-details">
                        <div><b>Ticket ID:</b> {current.requestId}</div>
                        <div><b>Subject:</b> {current.subject}</div>
                        <div><b>Priority:</b> {current.userReportedPriority}</div>
                        <div><b>Status:</b> {current.status}</div>
                        <div><b>Category:</b> {current.category}</div>
                        <div ><b>Description:</b> {current.description}</div>
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

                        {errorInc && <div className="error-message">Error: {errorInc}</div>}

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
                                disabled={isCreatingInc || !impact || !urgency}
                            >
                                {isCreatingInc ? "Creating..." : "Create Incident"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    export default CreateFormIncident;