// src/pages/StartFramingStep1.jsx
import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "../styles/start-framing.css";
import photoFrameIcon from "../assets/icons/photoframe.png";
import emptyFrameIcon from "../assets/icons/emptyframe.png";
import photoPrintsIcon from "../assets/icons/photoprints.png";

export default function StartFramingStep1() {
  const navigate = useNavigate();

  // IMPORTANT: keys must match the dynamic route /start-framing/size/:service
  // photo-frame -> print size
  // empty-frame -> frame size
  // only-prints -> print size (later)
  const slides = useMemo(
    () => [
      {
        key: "photo-frame",
        title: "Photo Frame",
        desc: "Upload your photo, and we’ll print and frame it for you",
        bg: "sf-slide-yellow",
        icon: "🖼️",
        thumb: photoFrameIcon,
      },
      {
        key: "empty-frame",
        title: "Empty Frame",
        desc: "Have your own art? Get a frame you can easily open, insert, and hang.",
        bg: "sf-slide-mint",
        icon: "🪟",
        thumb: emptyFrameIcon,
      },
      {
        key: "only-prints",
        title: "Only Prints",
        desc: "Need only a print? Upload your photo or artwork — we’ll print it on premium paper.",
        bg: "sf-slide-lilac",
        icon: "🖨️",
        thumb: photoPrintsIcon,
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  const scrollToIndex = (idx) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`[data-slide="${idx}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    const left = el.scrollLeft;

    let best = 0;
    let bestDist = Infinity;

    children.forEach((c, idx) => {
      const dist = Math.abs(c.offsetLeft - left);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });

    setActive(best);
  };

  const services = useMemo(
    () => [
      {
        key: "photo-frame",
        title: "Photo Frame",
        desc: "Upload your photo, and we’ll print and frame it for you",
        icon: photoFrameIcon,
        badge: "Popular",
      },
      {
        key: "empty-frame",
        title: "Empty Frame",
        desc: "Have your own art? Get a frame you can easily open, insert, and hang.",
        icon: emptyFrameIcon,
      },
      {
        key: "only-prints",
        title: "Only Prints",
        desc: "Need only a print? Upload your photo or artwork — we’ll print it on premium paper.",
        icon: photoPrintsIcon,
      },
    ],
    []
  );

  const goSize = (serviceKey) => {
    // For now: all go to the SizeSelection page, which will show
    // print size for photo-frame/only-prints and frame size for empty-frame
    navigate(`/start-framing/size/${serviceKey}`);
  };

  return (
    <div className="sf-page">
      {/* Keep header intact from landing page */}
      <SiteHeader variant="startFraming" />

      <div className="sf-shell">
        {/* Chips */}
        <div className="sf-chips">
          <span className="sf-chip">★ Premium paper</span>
          <span className="sf-chip">✓ Made to order</span>
          <span className="sf-chip">🚚 Fast delivery</span>
        </div>

        {/* Slider */}
        <section className="sf-slider" aria-label="Start framing product slider">
          <div className="sf-sliderTop">
            <h1 className="sf-h1">Start Framing</h1>

            <div className="sf-dots" aria-label="Slider dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`sf-dot ${i === active ? "is-active" : ""}`}
                  onClick={() => {
                    setActive(i);
                    scrollToIndex(i);
                  }}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="sf-track" ref={trackRef} onScroll={onScroll}>
            {slides.map((s, idx) => (
              <motion.div
                key={s.key}
                className={`sf-slide ${s.bg}`}
                data-slide={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="sf-slideThumb">
                  <img src={s.thumb} alt="" />
                </div>

                <div className="sf-slideContent">
                  <div className="sf-slideTitle">{s.title}</div>
                  <div className="sf-slideDesc">{s.desc}</div>

                  <div className="sf-slideActions">
                    <button className="sf-startBtn" type="button" onClick={() => goSize(s.key)}>
                      Start <span aria-hidden>→</span>
                    </button>
                    <div className="sf-miniIcon" title="Type">
                      {s.icon}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* List */}
        <div className="sf-sectionTitle">Pick a service</div>

        <div className="sf-list">
          {services.map((s) => (
            <button className="sf-row" key={s.key} type="button" onClick={() => goSize(s.key)}>
              <div className="sf-rowIcon">
                <img src={s.icon} alt="" />
              </div>

              <div className="sf-rowBody">
                <div className="sf-rowTop">
                  <div className="sf-rowTitle">{s.title}</div>
                  {s.badge ? <span className="sf-badge">{s.badge}</span> : null}
                </div>
                <div className="sf-rowDesc">{s.desc}</div>
              </div>

              <div className="sf-rowArrow">›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
