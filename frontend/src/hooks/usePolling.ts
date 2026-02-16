import {useEffect, useRef} from "react";

type Args = {
    enabled: boolean;
    intervalMs: number;
    isSyncing: boolean;
    tick: () => void;
};

export function usePolling({ enabled, intervalMs, isSyncing, tick }: Args) {
    const syncingRef = useRef(isSyncing);


    useEffect(() => {
        syncingRef.current = isSyncing;
    }, [isSyncing]);

    useEffect(() => {
        if (!enabled) return;

        const run = () => {
            if (document.visibilityState !== "visible") return;
            if (syncingRef.current) return;
            tick();
        };

        run();

        const id = window.setInterval(run, intervalMs);
        return () => window.clearInterval(id);
    }, [enabled, intervalMs, tick]);
}
