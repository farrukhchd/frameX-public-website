import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "../styles/landing.css";

function useFadeUp() {
  const reduce = useReducedMotion();
  return useMemo(() => {
    if (reduce) return {};
    return {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-120px" },
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    };
  }, [reduce]);
}

export default function HowItWorks() {
  const fade = useFadeUp();

  return (
    <div className="fx-root">
      <SiteHeader />

      <section className="fx-hero fx-heroSmall">
        <div className="fx-container fx-heroGrid">
          <motion.div {...fade}>
            <h1 className="fx-h1">How FrameX works</h1>
            <p className="fx-lead">
              From upload to delivery, see the steps that make ordering a custom frame easy and transparent.
            </p>
            <div className="fx-ctaRow">
              <Link className="fx-btnPrimary fx-linkBtn" to="/start-framing">
                Start framing
              </Link>
              <Link className="fx-btnGhost fx-linkBtn" to="/gallery">
                View styles
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="fx-heroMedia"
          >
            <img src="https://placehold.co/1600x1200?text=How+It+Works" alt="How FrameX works" />
          </motion.div>
        </div>
      </section>

      <section className="fx-section">
        <div className="fx-container">
          <motion.div {...fade}>
            <h2 className="fx-h2">The process in four simple steps</h2>
            <p className="fx-sub">
              Upload your image, choose a frame, preview it instantly, and receive your order ready to hang.
            </p>
          </motion.div>

          <div className="fx-divider" />

          <div className="fx-grid3 fx-processGrid">
            <motion.div {...fade}>
              <span className="fx-step">01</span>
              <h3>Upload your photo</h3>
              <p>
                Pick a picture, artwork, certificate, or poster from your phone or computer in just a few clicks.
              </p>
            </motion.div>

            <motion.div {...fade}>
              <span className="fx-step">02</span>
              <h3>Choose a frame style</h3>
              <p>
                Select from premium frames and mat options. We only show in-stock, active styles so you can order confidently.
              </p>
            </motion.div>

            <motion.div {...fade}>
              <span className="fx-step">03</span>
              <h3>Preview instantly</h3>
              <p>
                See how your art looks with the selected frame before you checkout — no surprises.
              </p>
            </motion.div>

            <motion.div {...fade}>
              <span className="fx-step">04</span>
              <h3>Delivered ready to hang</h3>
              <p>
                Your frame arrives with protective packaging and hanging hardware, ready for the wall.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="fx-section fx-featureGrid">
        <div className="fx-container fx-grid2">
          <motion.div {...fade}>
            <h3>Why customers love it</h3>
            <ul className="fx-bulletList">
              <li>Transparent pricing shown before checkout</li>
              <li>Only active, in-stock frames are offered</li>
              <li>Fast preview with real artwork mockup</li>
              <li>Secure delivery across Pakistan</li>
            </ul>
          </motion.div>

          <motion.div {...fade}>
            <div className="fx-infoCard">
              <h4>What we handle for you</h4>
              <p>
                From print-safe framing materials to custom sizing and packaging, we take the hard part off your hands.
              </p>
              <p>
                If you want a premium upgrade, choose a thicker profile, double mat, or anti-glare finish during preview.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="fx-ctaSection">
        <div className="fx-container fx-ctaBar">
          <div>
            <div className="fx-ctaTitle">Ready for a custom frame without the hassle?</div>
            <div className="fx-ctaText">
              Start your order now and see the frame on your art before you pay.
            </div>
          </div>
          <Link className="fx-btnPrimary fx-linkBtn" to="/start-framing">
            Start framing
          </Link>
        </div>
      </section>
    </div>
  );
}
