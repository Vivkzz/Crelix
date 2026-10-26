"use client";

import { useEffect, useRef, type RefObject } from "react";
import { AGENTS } from "@/components/site/home/agents";

type RGB = [number, number, number];
export type ThreadHue = { rgb: RGB; rgbDark: RGB };

/**
 * Six bundles of fine strands, one per agent hue, that enter from both
 * edges and pass through a single focal point: many threads, one launch.
 *
 * The focal point follows `focusRef` (its top-centre, nudged by `focusOffset`)
 * so it stays pinned to the product window as layout and scroll change.
 * Pauses when offscreen; draws a single still frame for reduced motion.
 */
export function Threads({
  focusRef,
  focusOffset = 0,
  spread = 0.22,
  tone = "auto",
  palette = AGENTS,
  className = "",
}: {
  focusRef?: RefObject<HTMLElement | null>;
  focusOffset?: number;
  /* vertical spread of the outermost bundle at the edges, as a fraction of height */
  spread?: number;
  /* "dark" forces additive glow, for threads drawn inside a dark band */
  tone?: "auto" | "dark";
  /* six bundle colours; defaults to the six agent hues */
  palette?: ThreadHue[];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const STRANDS = 9;
    const STEPS = 96;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    /* the intro clock starts the first time the canvas is on screen */
    let start = -1;
    /* pointer, eased toward the target each frame */
    const ptr = { x: -1, y: -1, tx: -1, ty: -1, k: 0, tk: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    const focus = () => {
      const el = focusRef?.current;
      if (!el) return { x: w / 2, y: h * 0.62 };
      const c = canvas.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - c.left, y: r.top - c.top + focusOffset };
    };

    const draw = (now: number) => {
      const dark = tone === "dark" || document.documentElement.classList.contains("dark");
      const t = reduce ? 4.2 : start < 0 ? 0 : (now - start) / 1000;
      const f = focus();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      ctx.lineCap = "round";

      ptr.x += (ptr.tx - ptr.x) * 0.08;
      ptr.y += (ptr.ty - ptr.y) * 0.08;
      ptr.k += (ptr.tk - ptr.k) * 0.06;

      const half = Math.max(f.x, w - f.x);
      /* narrow screens: keep the lens shallow so it never crosses the copy */
      const k = w < 700 ? 0.5 : 1;
      const gapB = (h * spread * k) / 2.5;
      const gapS = Math.max(1.6, h * 0.0052 * k);

      palette.forEach((agent, b) => {
        const [r, g, bl] = dark ? agent.rgbDark : agent.rgb;
        /* intro: each bundle streams in from the edges, staggered */
        const intro = reduce ? 1 : Math.min(Math.max((t - 0.15 - b * 0.09) / 1.5, 0), 1);
        const reach = 1 - Math.pow(1 - intro, 3);
        const threshold = (1 - reach) * 1.08;

        for (let s = 0; s < STRANDS; s++) {
          const centre = s === (STRANDS - 1) / 2;
          const alpha = (dark ? 0.42 : 0.3) * (centre ? 1.7 : 1);
          ctx.strokeStyle = `rgba(${r},${g},${bl},${Math.min(alpha, 0.85)})`;
          ctx.lineWidth = centre ? 1.35 : 0.9;
          ctx.beginPath();
          let pen = false;
          for (let i = 0; i <= STEPS; i++) {
            const x = -20 + (i / STEPS) * (w + 40);
            const d = (x - f.x) / half;
            const ad = Math.abs(d);
            if (ad < threshold) {
              pen = false;
              continue;
            }
            const side = d < 0 ? -1 : 1;
            const env = Math.pow(Math.min(ad, 1.15), 1.3);
            /* lens: bundle order inverts through the focal point */
            const bundle = (b - 2.5) * gapB * side;
            /* ribbon twist: strands fan and pinch along the length */
            const twist = 0.55 + 0.45 * Math.sin(d * 3.1 + t * 0.6 + b * 1.3);
            const strand = (s - (STRANDS - 1) / 2) * gapS * twist;
            const wave =
              k * h * 0.045 * Math.sin(d * 2.3 + t * 0.42 + b * 0.85) +
              k * h * 0.018 * Math.sin(d * 5.2 - t * 0.7 + b * 1.9);
            let y = f.y + env * (bundle + strand + wave);
            /* the cursor brushes the silk: strands lean toward it */
            if (ptr.k > 0.01) {
              const dx = x - ptr.x;
              const fall = Math.exp(-(dx * dx) / (2 * 140 * 140));
              y += (ptr.y - y) * 0.12 * fall * ptr.k * env;
            }
            if (!pen) {
              ctx.moveTo(x, y);
              pen = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      });

      /* the bindu: a small bright point where every thread meets */
      const arrived = reduce ? 1 : Math.min(Math.max((t - 1.4) / 0.9, 0), 1);
      if (arrived > 0) {
        ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
        const rad = 26 + 6 * Math.sin(t * 1.4);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
        g.addColorStop(0, dark ? `rgba(255,255,255,${0.9 * arrived})` : `rgba(255,255,255,${0.95 * arrived})`);
        g.addColorStop(0.18, `rgba(122,92,255,${0.35 * arrived})`);
        g.addColorStop(1, "rgba(122,92,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      draw(now);
      if (running) raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || reduce) return;
      if (start < 0) start = performance.now();
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    draw(performance.now());

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause()), { threshold: 0 });
    io.observe(canvas);

    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVis);

    const host = canvas.parentElement?.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      ptr.tx = e.clientX - r.left;
      ptr.ty = e.clientY - r.top;
      if (ptr.x < 0) {
        ptr.x = ptr.tx;
        ptr.y = ptr.ty;
      }
      ptr.tk = 1;
    };
    const onLeave = () => {
      ptr.tk = 0;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    /* redraw a still frame when the theme flips under reduced motion */
    const mo = new MutationObserver(() => draw(performance.now()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [focusRef, focusOffset, spread, tone, palette]);

  return <canvas ref={canvasRef} className={`ek-threads ${className}`} aria-hidden="true" />;
}
