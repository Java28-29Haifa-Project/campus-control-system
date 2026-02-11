
import { useEffect } from "react";

type Args = {
    enabled: boolean;
    intervalMs: number;
    isSyncing: boolean;
    tick: () => void;
};

export function usePolling({ enabled, intervalMs, isSyncing, tick }: Args) {
    useEffect(() => {
        if (!enabled) return;

        const run = () => {
            if (document.visibilityState !== "visible") return;
            if (isSyncing) return;
            tick();
        };

        run();

        const id = window.setInterval(run, intervalMs);
        return () => window.clearInterval(id);
    }, [enabled, intervalMs, isSyncing, tick]);
}

