import {type FC, type FormEvent, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {type Ticket, TicketStatus} from "../types/ticketTypes.ts";
import {type CreateIncidentRequest, IncidentImpact, IncidentUrgencies} from "../types/incidentTypes.ts";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {createIncidentThunk, resetErrorInc} from "../state/slices/incidentSlice.ts";
import {updateTicketThunk} from "../state/slices/ticketSlice.ts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  selectedTickets: Ticket[];
};

type SubmitData = {
  impact: IncidentImpact;
  urgency: IncidentUrgencies;
};


const MergeTicketModal: FC<Props> = ({isOpen, onClose, onClear, selectedTickets}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dispatch = useAppDispatch();

  const {errorInc, isCreatingInc} = useAppSelector((state) => state.incident);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [baseTicketId, setBaseTicketId] = useState("");
  const [impact, setImpact] = useState<IncidentImpact | "">("");
  const [urgency, setUrgency] = useState<IncidentUrgencies | "">("");
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [isOpen]);

  const resetModal = () => {
    setIsConfirmed(false);
    setBaseTicketId("");
    setImpact("");
    setUrgency("");
    setConfirmedTicket(null);
  }

  const handleConfirm = () => {
    if (baseTicketId) {
      setIsConfirmed(true);
      const index = selectedTickets.findIndex(ticket => ticket.requestId === baseTicketId);
      setConfirmedTicket(selectedTickets[index]);
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const data = Object.fromEntries(fd.entries()) as SubmitData;
    const ticketIds = selectedTickets.map(ticket => ticket.requestId);

    const payload: CreateIncidentRequest = {
      urgency: data.urgency,
      impact: data.impact,
      ticketIds,
      category: confirmedTicket?.category || "",
      description: confirmedTicket?.description || ""
    };

    try {
      await dispatch(createIncidentThunk(payload)).unwrap();
      try {
        await Promise.all(
          selectedTickets.map(ticket =>
            dispatch(updateTicketThunk({
              id: ticket.requestId,
              updates: {status: TicketStatus.InService}
            })).unwrap()
          )
        );
      } catch (e) {
        console.error("Incident created, but status update failed", e);
      }
      resetModal();
      onClose();
      onClear();
    } catch (e) {
      console.error("Create incident failed", e);
    }
  }

  const handleErrorReset = () => {
    dispatch(resetErrorInc());
    resetModal();
    onClose();
  }

  return (
    createPortal(
      <dialog
        ref={dialogRef}
        className={"merge-tickets-modal"}
        onCancel={() => onClose()}
      >
        {errorInc ? (
          <div className={"modal-error-container"}>
            <p>{errorInc}</p>
            <button className="btn-cancel" onClick={handleErrorReset}>Ok</button>
          </div>
          ) : (
            <form className="modal-container" onSubmit={(event) => handleSubmit(event)}>
              {!isConfirmed ? (
                <>
                  <h3>
                    If you really want to merge tickets and create an incident, select the base ticket
                  </h3>
                  {selectedTickets.map(ticket => (
                    <div key={ticket.requestId} className={"merge-input-block"}>
                      <input
                        type={"radio"}
                        name={"ticketId"}
                        value={ticket.requestId}
                        checked={ticket.requestId === baseTicketId}
                        onChange={() => setBaseTicketId(ticket.requestId)}
                      />
                      <div className="mini-details">
                        <div><b>Ticket ID:</b> {ticket.requestId}</div>
                        <div><b>Subject:</b> {ticket.subject}</div>
                        <div><b>Priority:</b> {ticket.userReportedPriority}</div>
                        <div><b>Status:</b> {ticket.status}</div>
                        <div><b>Category:</b> {ticket.category}</div>
                        <div><b>Description:</b> {ticket.description}</div>
                      </div>
                    </div>
                  ))}

                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose} type={"button"}>
                      Cancel
                    </button>
                    <button
                      className="secondary-btn merge-tickets-btn"
                      onClick={handleConfirm}
                      type={"button"}
                      disabled={baseTicketId === ""}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mini-details">
                    <div><b>Ticket ID:</b> {confirmedTicket?.requestId}</div>
                    <div><b>Subject:</b> {confirmedTicket?.subject}</div>
                    <div><b>Priority:</b> {confirmedTicket?.userReportedPriority}</div>
                    <div><b>Status:</b> {confirmedTicket?.status}</div>
                    <div><b>Category:</b> {confirmedTicket?.category}</div>
                    <div><b>Description:</b> {confirmedTicket?.description}</div>
                  </div>
                  <div className={"merge-select-container full-width"}>
                    <div className="select-box full-width">
                      <select
                        className={"full-width"}
                        value={impact}
                        onChange={(e) => setImpact(e.target.value as IncidentImpact | "")}
                        name={"impact"}
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
                    <div className="select-box full-width">
                      <select
                        value={urgency}
                        name={"urgency"}
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
                  </div>


                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setIsConfirmed(false)} type={"button"}>
                      Return
                    </button>
                    <button
                      className="secondary-btn merge-tickets-btn"
                      type={"submit"}
                      disabled={isCreatingInc || !impact || !urgency}
                    >
                      {isCreatingInc ? "Creating..." : "Create"}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
      </dialog>, document.body
    )
  );
};

export default MergeTicketModal;