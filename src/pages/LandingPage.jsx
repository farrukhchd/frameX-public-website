import React, { useMemo, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/landing.css";
import FrameStylesGallery from "../components/FrameStylesGallery";
function useFadeUp() {
  const reduce = useReducedMotion();
  return useMemo(() => {
    if (reduce) return {};
    return {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-120px" },
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    };
  }, [reduce]);
}

/** Mouse-drag horizontal scroll gallery */
function DraggableGallery() {
  const scrollerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef({ startX: 0, startScrollLeft: 0 });

  // Captions rewritten to focus on use-cases customers recognize
  const items = [
    { t: "Living Room Gallery Wall", src: "https://placehold.co/1200x900?text=Gallery+01" },
    { t: "Classic Black — Photography", src: "https://placehold.co/1200x900?text=Gallery+02" },
    { t: "Warm Wood — Art Prints", src: "https://placehold.co/1200x900?text=Gallery+03" },
    { t: "Clean White — Certificates", src: "https://placehold.co/1200x900?text=Gallery+04" },
    { t: "Slim Profile — Posters", src: "https://placehold.co/1200x900?text=Gallery+05" },
    { t: "Double Mat — Portraits", src: "https://placehold.co/1200x900?text=Gallery+06" },
    { t: "Neutral Corner — Minimal Look", src: "https://placehold.co/1200x900?text=Gallery+07" },
    { t: "Desk & Shelf Frames", src: "https://placehold.co/1200x900?text=Gallery+08" },
  ];

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
        aria-label="FrameX styles gallery"
      >
        {items.map((it) => (
          <div className="fx-galleryCard" key={it.t}>
            <img src={it.src} alt={it.t} draggable={false} />
            <div className="fx-galleryCaption">{it.t}</div>
          </div>
        ))}
      </div>

      <div className="fx-galleryHint">
        Browse styles to find what suits your space → 
      </div>
    </div>
  );
}

function PricingStrip() {
  return (
    <section className="fx-section fx-pricing" id="pricing">
      <div className="fx-container">
        <div className="fx-between">
          <div>
            <h2 className="fx-h2">Clear pricing, no confusion.</h2>
            <p className="fx-sub">
              Pick a style and get an instant price based on your size, frame, and mat selection.
            </p>
          </div>
          <div className="fx-note">
            Prices start from common sizes. Your final price updates before you place the order.
          </div>
        </div>

        <div className="fx-divider" />

        <div className="fx-priceGrid">
          <div className="fx-priceCol">
            <div className="fx-priceTop">
              <div className="fx-priceName">Essential</div>
              <div className="fx-priceValue">
                <span>Starting from</span> Rs. 2,999
              </div>
            </div>
            <ul className="fx-priceList">
              <li>Clean, minimal frame styles</li>
              <li>Front protection to keep prints safe</li>
              <li>Ready-to-hang hardware included</li>
              <li>Secure packaging for delivery</li>
            </ul>
            <Link className="fx-btnPrimary fx-btnFull fx-linkBtn" to="/start-framing">
              Start with Essential
            </Link>
          </div>

          <div className="fx-priceCol fx-priceFeatured">
            <div className="fx-badgeTop">Most popular</div>
            <div className="fx-priceTop">
              <div className="fx-priceName">Gallery</div>
              <div className="fx-priceValue">
                <span>Starting from</span> Rs. 4,999
              </div>
            </div>
            <ul className="fx-priceList">
              <li>Best-seller frames + mat options</li>
              <li>Sharper finishing for a premium look</li>
              <li>Perfect for gifts & feature walls</li>
              <li>Priority support on WhatsApp</li>
            </ul>
            <Link className="fx-btnPrimary fx-btnFull fx-linkBtn" to="/start-framing">
              Choose Gallery
            </Link>
          </div>

          <div className="fx-priceCol">
            <div className="fx-priceTop">
              <div className="fx-priceName">Museum</div>
              <div className="fx-priceValue">
                <span>Starting from</span> Rs. 7,999
              </div>
            </div>
            <ul className="fx-priceList">
              <li>Premium presentation + mat choices</li>
              <li>Anti-glare / UV options available</li>
              <li>Ideal for artwork & important pieces</li>
              <li>Gift-ready packaging available</li>
            </ul>
            <Link className="fx-btnPrimary fx-btnFull fx-linkBtn" to="/start-framing">
              Go Museum Grade
            </Link>
          </div>
        </div>

        <div className="fx-priceFine">
          Final pricing depends on size and options — you’ll always see the total before checkout.
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ onStartFraming }) {
  const fade = useFadeUp();

  return (
    <div className="fx-root">
      {/* NAV */}
      <SiteHeader />

      {/* HERO */}
      <section className="fx-hero">
        <div className="fx-container fx-heroGrid">
          <motion.div {...fade}>
            <h1 className="fx-h1">Frame what matters.</h1>
            <p className="fx-lead">
              Make your photos, artwork, and certificates look premium — with frames that fit your space and arrive ready to hang.
            </p>

            <div className="fx-ctaRow">
              <Link className="fx-btnPrimary fx-linkBtn" to="/start-framing">
                Start framing
              </Link>
              <a className="fx-btnGhost" href="#gallery">
                Explore styles
              </a>
            </div>

            <div className="fx-microRow">
              <span>See a preview before ordering</span>
              <span className="fx-dotSep" />
              <span>Secure packaging for safe delivery</span>
              <span className="fx-dotSep" />
              <span>Support when you need it</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="fx-heroMedia"
          >
            <img src="https://placehold.co/1800x1400?text=FrameX" alt="FrameX frames preview" />
          </motion.div>
        </div>
      </section>

      {/* RIBBON */}
      <section className="fx-ribbon">
        <div className="fx-container fx-ribbonInner">
          <span>Made to your size</span><span className="fx-ribbonDot" />
          <span>Minimal premium looks</span><span className="fx-ribbonDot" />
          <span>Optional mats (single/double)</span><span className="fx-ribbonDot" />
          <span>Arrives ready to hang</span><span className="fx-ribbonDot" />
          <span>Perfect for home & office</span>
        </div>
      </section>

      {/* PROCESS */}
      <section className="fx-section" id="process">
        <div className="fx-container">
          <motion.div {...fade}>
            <h2 className="fx-h2">Done in minutes. Looks perfect for years.</h2>
            <p className="fx-sub">
              No long back-and-forth. Choose a frame style, see your preview, and order with confidence.
            </p>
          </motion.div>

          <div className="fx-divider" />

          <div className="fx-grid3 fx-processGrid">
            <motion.div {...fade}>
              <span className="fx-step">01</span>
              <h3>Upload</h3>
              <p>Choose your photo, artwork, or certificate from your phone or laptop.</p>
              <Link className="fx-link" to="/start-framing">
                Start framing →
              </Link>
            </motion.div>

            <motion.div {...fade}>
              <span className="fx-step">02</span>
              <h3>Preview & personalize</h3>
              <p>Select your frame color and mat option — see how it looks instantly.</p>
              <a className="fx-link" href="#gallery">
                Explore styles →
              </a>
            </motion.div>

            <motion.div {...fade}>
              <span className="fx-step">03</span>
              <h3>Delivered ready to hang</h3>
              <p>Your frame arrives safely packed with hardware — just unbox and hang.</p>
              <a className="fx-link" href="#pricing">
                Check pricing →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="fx-section fx-gallerySection" id="gallery">
        <div className="fx-container fx-between">
          <div>
            <h2 className="fx-h2">See styles that fit your space.</h2>
            <p className="fx-sub">
              Explore customer-favorite looks for living rooms, offices, gifts, and gallery walls.
            </p>
          </div>
          <a className="fx-btnGhost" href="#pricing">
            View pricing
          </a>
        </div>

        <div className="fx-divider fx-container" />
        <FrameStylesGallery />
      </section>

      {/* PRICING */}
      <PricingStrip />

      {/* CTA */}
      <section className="fx-ctaSection">
        <div className="fx-container fx-ctaBar">
          <div>
            <div className="fx-ctaTitle">Make it look premium — starting today.</div>
            <div className="fx-ctaText">
              Upload your photo, choose a frame style, and see the final price before you order.
            </div>
          </div>
          <Link className="fx-btnPrimary fx-linkBtn" to="/start-framing">
            Start framing
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="fx-footer">
        <div className="fx-container fx-footerInner">
          <span>© {new Date().getFullYear()} FrameX</span>
          <div className="fx-footerLinks">
            <a href="#process">How it works</a>
            <a href="#gallery">Styles</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
