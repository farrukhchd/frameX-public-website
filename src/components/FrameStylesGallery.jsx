import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchMouldings } from "../services/apiService";

// Landing gallery that uses SAME API as FrameSelection
export default function FrameStylesGallery() {
  const scrollerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef({ startX: 0, startScrollLeft: 0 });

  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchMouldings()
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        // (optional) sort or pick top ones
        setFrames(arr);
      })
      .catch(() => mounted && setFrames([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // keep landing neat: show first 10–14 (adjust as you like)
  const visibleFrames = useMemo(() => frames.slice(0, 12), [frames]);

  const onPointerDown = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    setDragging(true);
    el.setPointerCapture?.(e.pointerId);
    dragState.current.startX = e.clientX;
    dragState.current.startScrollLeft = el.scrollLeft;
  };

  const onPointerMove = (e) => {
    const el = scrollerRef.current;
    if (!el || !dragging) return;
    const dx = e.clientX - dragState.current.startX;
    el.scrollLeft = dragState.current.startScrollLeft - dx;
  };

  const endDrag = (e) => {
    const el = scrollerRef.current;
    setDragging(false);
    try {
      el?.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  return (
    <div className="fx-galleryWrap">
      <div
        ref={scrollerRef}
        className={`fx-galleryScroller ${dragging ? "is-dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="region"
        aria-label="FrameX frames gallery"
      >
        {loading ? (
          // quick skeleton
          Array.from({ length: 8 }).map((_, i) => (
            <div className="fx-galleryCard fx-skel" key={i}>
              <div className="fx-skelImg" />
              <div className="fx-skelLine" />
              <div className="fx-skelLine sm" />
            </div>
          ))
        ) : visibleFrames.length ? (
          visibleFrames.map((f) => (
            <div className="fx-galleryCard" key={f.id || `${f.name}-${f.color}`}>
              <img
                src={f.cornerImage || "https://placehold.co/1200x900?text=Frame"}
                alt={f.name || "Frame"}
                draggable={false}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1200x900?text=Frame";
                }}
              />

              <div className="fx-galleryCaption">
                <div className="fx-capTitle">{f.name || "Frame"}</div>
                {f.tagline ? <div className="fx-capSub">{f.tagline}</div> : null}

                {/* optional small meta (remove if you want it cleaner) */}
                <div className="fx-capMeta">
                  {f.color ? <span>{String(f.color)}</span> : null}
                  {f.material ? <span>• {f.material}</span> : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="fx-galleryEmpty">No frames available right now.</div>
        )}
      </div>

      <div className="fx-galleryHint">
        Browse frames to find what suits your space →
      </div>
    </div>
  );
}
