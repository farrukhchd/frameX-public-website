import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/site-header.css";
import { showCartSheet } from "./CartBottomSheet";
import CartStore from "../store/CartStore";

const CART_EVENT = "framex:cart-updated";

export default function SiteHeader() {
  const location = useLocation();

  // scroll visuals
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  // cart badge + pulse
  const [cartCount, setCartCount] = useState(() => {
    const items = CartStore.getItems?.() || [];
    return items.reduce((sum, i) => sum + Number(i?.quantity || 0), 0);
  });
  const [cartPulse, setCartPulse] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  // animated underline
  const navRef = useRef(null);
  const underlineRef = useRef(null);

  const appUrl =
    "https://play.google.com/store/apps/details?id=com.iqsolutions.framex&hl=en";

  // Determine active key for underline movement
  const activeKey = useMemo(() => {
    const p = location.pathname || "/";
    if (p.startsWith("/how-it-works")) return "how";
    if (p.startsWith("/gallery")) return "gallery";
    if (p.startsWith("/start-framing")) return "start";
    return ""; // home or other
  }, [location.pathname]);

  // Hide/show header on scroll (direction-based)
  useEffect(() => {
    let lastY = window.scrollY || 0;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY || 0;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(y > 6);

          const delta = y - lastY;

          // Only hide after some movement to avoid jitter
          if (Math.abs(delta) > 10) {
            if (y > 90 && delta > 0) {
              // scrolling down
              setHidden(true);
            } else if (delta < 0) {
              // scrolling up
              setHidden(false);
            }
          }

          lastY = y;
          ticking = false;
        });
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Cart count sync + pulse when count increases
  useEffect(() => {
    const syncCount = () => {
      const items = CartStore.getItems?.() || [];
      const next = items.reduce((sum, i) => sum + Number(i?.quantity || 0), 0);

      const prev = prevCartCountRef.current;
      setCartCount(next);

      if (next > prev) {
        setCartPulse(true);
        window.setTimeout(() => setCartPulse(false), 420);
      }

      prevCartCountRef.current = next;
    };

    syncCount();
    window.addEventListener(CART_EVENT, syncCount);
    // Safety (in case someone dispatches plain string)
    window.addEventListener("framex:cart-updated", syncCount);

    return () => {
      window.removeEventListener(CART_EVENT, syncCount);
      window.removeEventListener("framex:cart-updated", syncCount);
    };
  }, []);

  // Animated underline positioning (desktop nav)
  const positionUnderline = () => {
    const navEl = navRef.current;
    const u = underlineRef.current;
    if (!navEl || !u) return;

    const active = navEl.querySelector(`[data-nav="${activeKey}"]`);
    if (!active) {
      u.style.opacity = "0";
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();

    const left = aRect.left - navRect.left;
    const width = aRect.width;

    u.style.opacity = "1";
    u.style.transform = `translateX(${left}px)`;
    u.style.width = `${width}px`;
  };

  useLayoutEffect(() => {
    positionUnderline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  useEffect(() => {
    const onResize = () => positionUnderline();
    window.addEventListener("resize", onResize);

    // in case fonts load later and widths change
    const t = window.setTimeout(positionUnderline, 80);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className={`fx-nav ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
      <div className="fx-navGlow" aria-hidden="true" />

      <div className="fx-container fx-navInner">
        {/* Text Logo */}
        <Link to="/" className="fx-logoLink fx-textLogo" aria-label="FrameX Home">
          Frame<span>X</span>
        </Link>

        {/* Desktop nav */}
        <nav className="fx-navLinks" aria-label="Primary" ref={navRef}>
          <span ref={underlineRef} className="fx-activeUnderline" aria-hidden="true" />

          <Link
            to="/how-it-works"
            data-nav="how"
            className={`fx-navLink ${activeKey === "how" ? "is-active" : ""}`}
          >
            How It Works
          </Link>

          <Link
            to="/gallery"
            data-nav="gallery"
            className={`fx-navLink ${activeKey === "gallery" ? "is-active" : ""}`}
          >
            Gallery
          </Link>

          <Link
            to="/start-framing"
            data-nav="start"
            className={`fx-navLink fx-navCtaLink ${activeKey === "start" ? "is-active" : ""}`}
          >
            Start Framing
          </Link>

          <a className="fx-navLink fx-navApp" href={appUrl} target="_blank" rel="noreferrer">
            Mobile App <span className="fx-badge">New</span>
          </a>
        </nav>

        {/* Actions */}
        <div className="fx-navActions">
          <button
            className={`fx-cartBtn ${cartPulse ? "is-pulse" : ""}`}
            type="button"
            aria-label="Open cart"
            onClick={() => showCartSheet()}
          >
            <span className="fx-cartIcon" aria-hidden="true">🛒</span>

            {cartCount > 0 ? (
              <span className={`fx-cartBadge ${cartPulse ? "is-pulse" : ""}`}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>

          <Link className="fx-btnPrimary fx-linkBtn fx-desktopOnly" to="/start-framing">
            Start framing <span className="fx-btnArrow" aria-hidden="true">→</span>
          </Link>

          {/* Mobile menu */}
          <button
            className={`fx-burger ${mobileOpen ? "is-open" : ""}`}
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Trust strip */}
      <div className="fx-trustStrip">
        <div className="fx-container fx-trustInner">
          <span className="fx-star" aria-hidden="true">⭐</span>
          <span className="fx-trustText">
            10k+ frames delivered • Premium materials • Nationwide delivery
          </span>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`fx-mobilePanel ${mobileOpen ? "is-open" : ""}`}>
        <div className="fx-mobileInner">
          <Link className="fx-mobileLink" to="/how-it-works">How It Works</Link>
          <Link className="fx-mobileLink" to="/gallery">Gallery</Link>
          <Link className="fx-mobileLink fx-mobileCta" to="/start-framing">
            Start Framing <span className="fx-btnArrow" aria-hidden="true">→</span>
          </Link>
          <a className="fx-mobileLink" href={appUrl} target="_blank" rel="noreferrer">
            Mobile App
          </a>

          <div className="fx-mobileRow">
            <button
              type="button"
              className="fx-btnGhost fx-mobileBtn"
              onClick={() => showCartSheet()}
            >
              Open Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </button>

            <Link className="fx-btnPrimary fx-mobileBtn" to="/start-framing">
              Start framing <span className="fx-btnArrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
