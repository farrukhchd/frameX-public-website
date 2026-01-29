import { useEffect, useState } from "react";
import { fetchMouldings } from "../services/apiService";

export function useFrames({ enabled }) {
  const [frames, setFrames] = useState([]);
  const [framesLoading, setFramesLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadFrames() {
      if (!enabled || framesLoading || frames.length > 0) return;

      setFramesLoading(true);
      try {
        const list = await fetchMouldings();
        if (!mounted) return;
        setFrames(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Frames fetch failed:", e);
      } finally {
        if (mounted) setFramesLoading(false);
      }
    }

    loadFrames();
    return () => {
      mounted = false;
    };
  }, [enabled, framesLoading, frames.length]);

  return { frames, framesLoading };
}
