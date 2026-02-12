
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {addIncidentCommentThunk, clearCurrentIncident, getIncidentByIdThunk} from "../../state/slices/incidentSlice.ts";

function formatDateTime(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
}

type Params = { id: string };

const IncidentDetailsPage: React.FC = () => {
    const { id } = useParams<Params>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { currentInc, isLoadingCurrentInc, errorInc } = useAppSelector((state) => state.incident);

    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);

    const isAdding = useAppSelector(
        (s) => s.incident.addingCommentByIncidentId?.[id ?? ""] ?? false
    );
    const addError = useAppSelector(
        (s) => s.incident.addCommentErrorByIncidentId?.[id ?? ""] ?? null
    );

    useEffect(() => {
        if (!id) return;

        dispatch(getIncidentByIdThunk(id));

        return () => {
            dispatch(clearCurrentIncident());
        };
    }, [dispatch, id]);

    const commentsSorted = useMemo(() => {
        const arr = currentInc?.comment ?? [];
        return [...arr].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    }, [currentInc?.comment]);

    const onSubmitComment = useCallback(async () => {
        if (!currentInc) return;

        const trimmed = text.trim();
        if (!trimmed) return;

        try {
            await dispatch(
                addIncidentCommentThunk({
                    incidentId: currentInc.incidentId,
                    commentText: trimmed,
                })
            ).unwrap();

            setText("");
            setOpen(false);
        } catch (e)  {
            console.error(e)
        }
    }, [dispatch, currentInc, text]);

    if (!id) {
        return (
            <div className="auth-page">
                <div className="login-wrapper ticket-details-wrapper">
                    <p>Incorrect incident id</p>

                    <div className="ticket-details-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/engineer/incident")}
                        >
                            ← Back to list
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoadingCurrentInc) {
        return <div>Loading incident...</div>;
    }

    if (errorInc) {
        return <div>Error: {errorInc}</div>;
    }

    if (!currentInc) {
        return (
            <div className="support-table-page">
                <p>Incident not found</p>

                <div className="ticket-details-actions">
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => navigate("/incident")}
                    >
                        ← Back to list
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="support-form-page details">
                <h1>Incident details</h1>

                <div className="mini-details">
                    <div>
                        <b>Incident ID:</b> {currentInc.incidentId}
                    </div>

                    <div>
                        <b>Tickets:</b>{" "}
                        {currentInc.ticketIds?.length ? currentInc.ticketIds.join(", ") : "—"}
                    </div>

                    <div>
                        <b>Priority:</b> {currentInc.priority}
                    </div>

                    <div>
                        <b>Status:</b> {currentInc.status}
                    </div>

                    <div>
                        <b>Category:</b> {currentInc.category}
                    </div>

                    <div>
                        <b>Description:</b> {currentInc.description}
                    </div>

                    <div>
                        <b>Created by:</b> {currentInc.createdBy}
                    </div>

                    <div>
                        <b>Assigned by:</b> {currentInc.assignedBy ?? "—"}
                    </div>

                    <div>
                        <b>Created at:</b> {formatDateTime(currentInc.createdAt)}
                    </div>

                    <div>
                        <b>Updated at:</b> {formatDateTime(currentInc.updatedAt)}
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <div className="row-space">
                            <b>Comments:</b>

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setOpen((v) => !v)}
                            >
                                {open ? "Close" : "+ Add comment"}
                            </button>
                        </div>

                        {open && (
                            <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                <textarea
                    className="comment-textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment…"
                    rows={4}
                />

                                {addError && (
                                    <div className="error-text" style={{ marginTop: 6 }}>
                                        {String(addError)}
                                    </div>
                                )}

                                <div className="ticket-form-actions" style={{ gap: 10 }}>
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => {
                                            setText("");
                                            setOpen(false);
                                        }}
                                        disabled={isAdding}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="primary-btn"
                                        onClick={onSubmitComment}
                                        disabled={isAdding || !text.trim()}
                                        title={!text.trim() ? "Write something first" : "Add comment"}
                                    >
                                        {isAdding ? "Adding..." : "Add"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 12 }}>
                            {!commentsSorted.length ? (
                                <div className="muted-text">No comments yet</div>
                            ) : (
                                <div className="comments-list">
                                    {commentsSorted.map((c) => (
                                        <div key={c.commentId} className="comment-card">
                                            <div className="comment-meta">
                        <span className="muted-text">
                          <b>{c.createdBy}</b>
                        </span>
                                                <span className="muted-text">{formatDateTime(c.createdAt)}</span>
                                            </div>

                                            <div className="comment-text">{c.commentText}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="ticket-form-actions">
                        <button
                            type="button"
                            className="secondary-btn back-btn"
                            onClick={() => navigate("/incident")}
                        >
                            ← Back to list
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetailsPage;
