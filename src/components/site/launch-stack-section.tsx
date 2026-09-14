"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Kalit-style Launch Stack — direct port of kalit.ai's stack-module.
 * Two slides in a swiper-like layout, with the exact SVG illustrations
 * (pipe diagrams) from kalit.ai.
 */

const PENTEST_ILLUSTRATION = (
  <svg viewBox="0 0 637 388" preserveAspectRatio="xMidYMid meet">
    <g opacity="0.25">
      <path d="M301.704 151.036h-27c-20.434 0-37-16.565-37-37s16.566-37 37-37h29c22.091 0 40-17.909 40-40v-37m-56.847 258.806c0 18.225 14.775 33 33 33h67c22.092 0 40-17.909 40-40v-95c0-14.912 12.089-27 27-27s27 12.088 27 27v162c0 14.911 12.089 27 27 27s27-12.089 27-27V118.3c0-22.091 17.909-40 40-40h62.847m-401 34.736h-59c-22.091 0-40 17.909-40 40v81.5c0 15.74 12.76 28.5 28.5 28.5s28.5-12.76 28.5-28.5-12.76-28.5-28.5-28.5h-75.5c-22.091 0-40 17.909-40 40v16c0 22.092-17.909 40-40 40h-11" />
    </g>
    <path d="M286.583 181.877v76.964m0-76.964c0 17.033 13.808 30.842 30.841 30.842s30.841-13.809 30.841-30.842-13.808-30.841-30.841-30.841h-15.475" />
  </svg>
);

const FLOW_ILLUSTRATION = (
  <svg viewBox="0 0 637 388" preserveAspectRatio="xMidYMid meet">
    <g opacity="0.25">
      <path d="M-1.856 78.342h92c22.091 0 40 17.909 40 40v52.25c0 12.564-10.186 22.75-22.75 22.75s-22.75-10.186-22.75-22.75v-.5c0-12.841 10.409-23.25 23.25-23.25h41.25c22.091 0 40 17.908 40 40v82c0 22.091 17.908 40 40 40h10.5c22.091 0 40-17.909 40-40v-24.5m76.5-33.5h13.5c16.844 0 30.5-13.656 30.5-30.5m-53.5-30.5h23c16.844 0 30.5 13.655 30.5 30.5m0 0h31.25c20.848 0 37.75-16.902 37.75-37.75v-1.25c0-20.159 16.341-36.5 36.5-36.5s36.5 16.341 36.5 36.5v116.5c0 22.091 17.908 40 40 40h55.5" />
    </g>
    <path d="M279.431 195.463v61.498" />
    <path d="M279.431 196.534c0-15.437 9.262-46.312 46.312-46.312h30.563m-30.563 60.375h30.563" />
  </svg>
);

type Slide = {
  id: string;
  suite: string;
  titleThin: string;
  titleBold: string;
  text: string;
  href: string;
  illustration: React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    id: "pentest",
    suite: "pentest",
    titleThin: "EKAM AI",
    titleBold: "pentest",
    text: "Run a structured pre-launch security scan on a target you own or are authorized to test. Pentest reports findings with evidence, severity, and guidance.",
    href: "/pentest",
    illustration: PENTEST_ILLUSTRATION,
  },
  {
    id: "flow",
    suite: "flow",
    titleThin: "EKAM AI",
    titleBold: "flow",
    text: "From a prompt to a live launch page or a full app in minutes. Design, copy, structure, frontend, and backend — built by AI agents, ready to publish.",
    href: "/flow",
    illustration: FLOW_ILLUSTRATION,
  },
];

export function LaunchStackSection() {
  const [order, setOrder] = useState([0, 1]);
  const [swapping, setSwapping] = useState(false);

  const swap = () => {
    if (swapping) return;
    setSwapping(true);
    setTimeout(() => {
      setOrder((prev) => [prev[1], prev[0]]);
      setSwapping(false);
    }, 250);
  };

  return (
    <div className="kalit-stack">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="kalit-stack-top">
          <div className="kalit-stack-heading">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
              Launch stack
            </div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.025em" }}>
              From launch page to
              <br />
              security check
            </h2>
          </div>
          <div className="kalit-stack-right">
            <p>
              Start with EKAM AI Flow to create and deploy your public site, then use
              EKAM AI Pentest to scan authorized targets before you announce.
            </p>
            <div className="kalit-stack-nav">
              <button aria-label="Previous" onClick={swap}>
                <ChevronLeft />
              </button>
              <button aria-label="Next" onClick={swap}>
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="kalit-stack-slider" style={{ opacity: swapping ? 0 : 1 }}>
          {order.map((idx) => {
            const slide = SLIDES[idx];
            return (
              <div key={slide.id} className="kalit-stack-slide">
                <div
                  className="kalit-stack-item"
                  data-suite={slide.suite}
                  id={slide.id}
                >
                  <div className="kalit-stack-middle">
                    {slide.illustration}
                  </div>
                  <div className="kalit-stack-bottom">
                    <h3>
                      <span>{slide.titleThin}</span> <strong>{slide.titleBold}</strong>
                    </h3>
                    <p className="kalit-stack-paragraph">{slide.text}</p>
                    <a
                      className="kalit-stack-link"
                      aria-label={slide.titleBold}
                      href={slide.href}
                    >
                      <svg viewBox="0 0 20 20">
                        <use href="/img/sprites.svg#arrow-top-right" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
