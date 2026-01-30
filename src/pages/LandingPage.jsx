import React, { useMemo, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/landing.css";

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

    const items = [
        { t: "Gallery Wall — Living Room", src: "https://placehold.co/1200x900?text=Gallery+01" },
        { t: "Minimal Black — Photography", src: "https://placehold.co/1200x900?text=Gallery+02" },
        { t: "Warm Wood — Art Print", src: "https://placehold.co/1200x900?text=Gallery+03" },
        { t: "White Frame — Certificate", src: "https://placehold.co/1200x900?text=Gallery+04" },
        { t: "Thin Profile — Poster", src: "https://placehold.co/1200x900?text=Gallery+05" },
        { t: "Double Mat — Portrait", src: "https://placehold.co/1200x900?text=Gallery+06" },
        { t: "Studio Corner — Neutral", src: "https://placehold.co/1200x900?text=Gallery+07" },
        { t: "Desk Frame — Minimal", src: "https://placehold.co/1200x900?text=Gallery+08" },
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
        } catch { }
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
                aria-label="Gallery (drag to scroll)"
            >
                {items.map((it) => (
                    <div className="fx-galleryCard" key={it.t}>
                        <img src={it.src} alt={it.t} draggable={false} />
                        <div className="fx-galleryCaption">{it.t}</div>
                    </div>
                ))}
            </div>

            <div className="fx-galleryHint">Drag horizontally (or use trackpad) to explore →</div>
        </div>
    );
}

function PricingStrip() {
    return (
        <section className="fx-section fx-pricing" id="pricing">
            <div className="fx-container">
                <div className="fx-between">
                    <div>
                        <h2 className="fx-h2">Simple pricing.</h2>
                        <p className="fx-sub">Clear tiers. Replace numbers later.</p>
                    </div>
                    <div className="fx-note">Tip: keep pricing “starting from” to avoid size complexity.</div>
                </div>

                <div className="fx-divider" />

                <div className="fx-priceGrid">
                    <div className="fx-priceCol">
                        <div className="fx-priceTop">
                            <div className="fx-priceName">Essential</div>
                            <div className="fx-priceValue"><span>From</span> $29</div>
                        </div>
                        <ul className="fx-priceList">
                            <li>Minimal frame profiles</li>
                            <li>Standard clear glazing</li>
                            <li>Wall-ready hardware</li>
                            <li>Protective packaging</li>
                        </ul>
                        <button className="fx-btnPrimary fx-btnFull">Choose Essential</button>
                    </div>

                    <div className="fx-priceCol fx-priceFeatured">
                        <div className="fx-badgeTop">Most popular</div>
                        <div className="fx-priceTop">
                            <div className="fx-priceName">Gallery</div>
                            <div className="fx-priceValue"><span>From</span> $49</div>
                        </div>
                        <ul className="fx-priceList">
                            <li>Best-seller profiles + mats</li>
                            <li>Upgraded glazing option</li>
                            <li>Clean corner finishing</li>
                            <li>Priority support</li>
                        </ul>
                        <button className="fx-btnPrimary fx-btnFull">Choose Gallery</button>
                    </div>

                    <div className="fx-priceCol">
                        <div className="fx-priceTop">
                            <div className="fx-priceName">Museum</div>
                            <div className="fx-priceValue"><span>From</span> $79</div>
                        </div>
                        <ul className="fx-priceList">
                            <li>Premium mat options</li>
                            <li>Anti-glare / UV (optional)</li>
                            <li>Elevated presentation</li>
                            <li>Gift-ready packaging</li>
                        </ul>
                        <button className="fx-btnPrimary fx-btnFull">Choose Museum</button>
                    </div>
                </div>

                <div className="fx-priceFine">
                    Pricing shown as placeholders. Replace with your real sizes/tiers anytime.
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
                            Minimal custom framing for photographs, art, certificates, and memories —
                            designed to live beautifully on your wall.
                        </p>

                        <div className="fx-ctaRow">
                            <Link className="fx-btnPrimary fx-linkBtn" to="/start-framing">
                                Start framing
                            </Link>
                            <button className="fx-btnGhost">Browse styles</button>
                        </div>

                        <div className="fx-microRow">
                            <span>Preview before we build</span>
                            <span className="fx-dotSep" />
                            <span>Protective packaging</span>
                            <span className="fx-dotSep" />
                            <span>Happiness guarantee</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.985 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-120px" }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="fx-heroMedia"
                    >
                        <img src="https://placehold.co/1800x1400?text=Replace+Hero+Image" alt="Hero" />
                    </motion.div>
                </div>
            </section>

            {/* RIBBON */}
            <section className="fx-ribbon">
                <div className="fx-container fx-ribbonInner">
                    <span>Custom framing</span><span className="fx-ribbonDot" />
                    <span>Clean profiles</span><span className="fx-ribbonDot" />
                    <span>Mat options</span><span className="fx-ribbonDot" />
                    <span>Wall-ready delivery</span><span className="fx-ribbonDot" />
                    <span>Made to look intentional</span>
                </div>
            </section>

            {/* PROCESS */}
            <section className="fx-section" id="process">
                <div className="fx-container">
                    <motion.div {...fade}>
                        <h2 className="fx-h2">A simple process.</h2>
                        <p className="fx-sub">Fewer decisions. A cleaner result. Designed to feel calm.</p>
                    </motion.div>

                    <div className="fx-divider" />

                    <div className="fx-grid3 fx-processGrid">
                        <motion.div {...fade}>
                            <span className="fx-step">01</span>
                            <h3>Upload</h3>
                            <p>Choose your photo or artwork.</p>
                            <a className="fx-link" href="#configurator">Try preview</a>
                        </motion.div>

                        <motion.div {...fade}>
                            <span className="fx-step">02</span>
                            <h3>Customize</h3>
                            <p>Select a curated frame and mat.</p>
                            <a className="fx-link" href="#pricing">See pricing</a>
                        </motion.div>

                        <motion.div {...fade}>
                            <span className="fx-step">03</span>
                            <h3>Delivered</h3>
                            <p>Arrives protected and ready to hang.</p>
                            <a className="fx-link" href="#gallery">View gallery</a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* DRAG GALLERY */}
            <section className="fx-section fx-gallerySection" id="gallery">
                <div className="fx-container fx-between">
                    <div>
                        <h2 className="fx-h2">Gallery you can drag.</h2>
                        <p className="fx-sub">Grab and scroll. Touch-friendly too.</p>
                    </div>
                    <button className="fx-btnGhost">See all</button>
                </div>

                <div className="fx-divider fx-container" />
                <DraggableGallery />
            </section>

            {/* PRICING */}
            <PricingStrip />


            {/* CTA */}
            <section className="fx-ctaSection">
                <div className="fx-container fx-ctaBar">
                    <div>
                        <div className="fx-ctaTitle">Ready to frame something?</div>
                        <div className="fx-ctaText">Upload a photo and choose a clean style in minutes.</div>
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
                        <a href="#process">Process</a>
                        <a href="#gallery">Gallery</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#configurator">Configurator</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
