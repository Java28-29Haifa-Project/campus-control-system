import React, { useMemo, useRef, useState } from "react";
import type {CommentIncident, Incident} from "../types/incidentTypes.ts";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {addIncidentCommentThunk} from "../state/slices/incidentSlice.ts";
import "../styles/comment.css";
import { FaPlus } from "react-icons/fa";

type Props = {
    incident: Incident;
};

function formatDt(iso?: string) {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
}

export const CommentCell: React.FC<Props> = ({ incident }) => {
    const dispatch = useAppDispatch();

    const isAdding =
        useAppSelector((s) => s.incident.addingCommentByIncidentId[incident.incidentId]) ?? false;

    const addError =
        useAppSelector((s) => s.incident.addCommentErrorByIncidentId[incident.incidentId]) ?? null;

    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    const panelRef = useRef<HTMLDivElement | null>(null);

    const comments = useMemo<CommentIncident[]>(() => {
        const arr = incident.comment ?? [];
        return [...arr].sort((a, b) =>
            (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
        );
    }, [incident.comment]);

    const close = () => {
        setOpen(false);
        setText("");
    };

    const onToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen((v) => !v);
    };

    const onSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const trimmed = text.trim();
        if (!trimmed) return;

        try {
            await dispatch(
                addIncidentCommentThunk({
                    incidentId: incident.incidentId,
                    commentText: trimmed,
                })
            ).unwrap();

            close();
        } catch {
            console.log("cannot add comment");
        }
    };

    return (
        <div className="comment-cell" onClick={(e) => e.stopPropagation()}>
            <div className="comment-cell-row">
        <span className="comment-cell-title">
          {comments.length ? `Comments: ${comments.length}` : "No comments"}
        </span>

                <button
                    type="button"
                    className="icon-btn"
                    title="Add comment"
                    onClick={onToggle}
                    disabled={isAdding}
                >
                    <FaPlus />
                </button>
            </div>


            {comments.length > 0 && (
                <div className="comment-list">
                    {comments.slice(0, 2).map((c) => (
                        <div key={c.commentId} className="comment-item">
                            <div className="comment-meta">
                                <span className="comment-author">{c.createdBy}</span>
                                <span className="comment-date">{formatDt(c.createdAt)}</span>
                            </div>
                            <div className="comment-text">{c.commentText}</div>
                        </div>
                    ))}
                    {comments.length > 2 && (
                        <div className="muted-text">+{comments.length - 2} more…</div>
                    )}
                </div>

            )}


            {open && (
                <div
                    className="comment-popover-backdrop"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        close();
                    }}
                >
                    <div
                        ref={panelRef}
                        className="comment-popover"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <div className="comment-popover-header">
                            <div className="comment-popover-title">Add comment</div>

                            <button
                                type="button"
                                className="icon-btn"
                                title="Close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    close();
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <textarea
                            className="comment-textarea"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a comment…"
                            rows={4}
                        />

                        {addError && <div className="error-text">{String(addError)}</div>}

                        <div className="comment-actions">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    close();
                                }}
                                disabled={isAdding}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={onSave}
                                disabled={isAdding || text.trim().length === 0}
                            >
                                {isAdding ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

