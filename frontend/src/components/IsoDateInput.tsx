import React, { useMemo, useRef } from "react";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function isoToYmd(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";

    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    return `${y}-${m}-${day}`;
}

function ymdToLocalDate(ymd: string) {
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function toIsoStartOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.toISOString();
}
function toIsoEndOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x.toISOString();
}

type IsoDateInputProps = {
    isoValue?: string;
    placeholder?: string;
    onChangeIso: (nextIso: string) => void;
    kind: "start" | "end";
    disabled?: boolean;
};

export const IsoDateInput: React.FC<IsoDateInputProps> = ({
                                                              isoValue,
                                                              placeholder,
                                                              onChangeIso,
                                                              kind,
                                                              disabled,
                                                          }) => {
    const ref = useRef<HTMLInputElement | null>(null);

    const ymd = useMemo(() => isoToYmd(isoValue), [isoValue]);

    const openPicker = () => {
        if (disabled) return;
        const el = ref.current;
        if (!el) return;

        if (typeof el.showPicker === "function") el.showPicker();
        else {
            el.focus();
            el.click();
        }
    };

    return (
        <div
            className="iso-date"
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
            }}
            onClick={openPicker}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openPicker();
            }}
        >
            <input
                ref={ref}
                type="date"
                value={ymd}
                disabled={disabled}
                onChange={(e) => {
                    const nextYmd = e.target.value;
                    if (!nextYmd) {
                        onChangeIso("");
                        return;
                    }
                    const d = ymdToLocalDate(nextYmd);
                    if (!d) {
                        onChangeIso("");
                        return;
                    }
                    onChangeIso(kind === "start" ? toIsoStartOfDay(d) : toIsoEndOfDay(d));
                }}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            />
        </div>
    );
};