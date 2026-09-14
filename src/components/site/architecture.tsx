"use client";

import { Section } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { AnimatedLine } from "@/components/site/animated-line";

/**
 * Architecture section — full-width, 2-column layout.
 * Left: heading + description + pillars.
 * Right: 3 layers with dash-line connectors + animated arch line.
 * No card container — blends into the page background.
 */

export function Architecture() {
  return (
    <Section id="architecture" className="relative !py-20">
      <div className="mx-auto max-w-7xl">
        {/* 2-column layout */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          {/* LEFT: heading + description + pillars */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
              The Architecture
            </div>
            <h2
              style={{
                fontSize: "clamp(36px, 3vw + 24px, 64px)",
                lineHeight: 0.95,
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              EKAM AI is not
              <br />
              <strong style={{ fontSize: "1.55em", display: "inline-block" }}>a model</strong>
            </h2>
            <p className="mt-5 text-base text-muted-foreground max-w-md">
              An execution layer that turns AI intelligence into structured workflows,
              deployed systems, and real business outcomes.
            </p>

            {/* Pillars below description */}
            <div className="mt-8 space-y-4">
              {[
                {
                  title: "Orchestrated, not chat",
                  desc: "EKAM AI coordinates multiple specialized agents as a single team — planning, coding, design, testing, deployment.",
                },
                {
                  title: "Structured workflows",
                  desc: "Every run produces evidence: deploy logs, scan findings, file diffs. Outcomes you can read and act on.",
                },
                {
                  title: "Real business outcomes",
                  desc: "From prompt to a live URL you can share, scan, and iterate on. Built for the launch moment.",
                },
              ].map((p, i) => (
                <Reveal key={p.title} delay={i * 80}>
                  <div className="flex gap-3">
                    <div
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: ["var(--color-1)", "var(--color-2)", "var(--color-3)"][i] }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold tracking-tight">{p.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* RIGHT: 3 layers + connectors + animated line */}
          <div className="relative">
            {/* Subtle background glow */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-3xl"
              style={{
                background: "radial-gradient(ellipse at center, rgba(145,229,0,0.06), transparent 70%)",
              }}
            />

            <div className="kalit-arch-layers">
              {/* Layer 1: AI models */}
              <div className="kalit-arch-layer kalit-arch-layer1">
                <h3>AI models</h3>
                <div className="kalit-arch-list">
                  <svg viewBox="0 0 89 23" aria-label="OpenAI">
                    <use href="/img/sprites.svg#open-ai" />
                  </svg>
                  <svg viewBox="0 0 143 16" aria-label="Anthropic">
                    <use href="/img/sprites.svg#anthropic" />
                  </svg>
                  <svg viewBox="0 0 88 30" aria-label="Google">
                    <use href="/img/sprites.svg#google" />
                  </svg>
                </div>
              </div>

              {/* Connector: layer1Line */}
              <svg viewBox="0 0 261 62" className="kalit-arch-layer1Line">
                <path d="M106.75 0.500244C114.494 2.76534 129.892 17.7487 130.244 59.528M130.244 59.528C130.248 59.9691 130.25 60.4133 130.25 60.8604M130.244 59.528C130.346 60.1867 130.431 60.8281 130.5 61.4504M130.244 59.528C130.24 59.5047 130.237 59.4814 130.233 59.4582M130.25 60.8604C130.25 60.9043 130.25 60.9482 130.25 60.9922M130.25 60.8604C130.248 60.3898 130.242 59.9224 130.233 59.4582M130.25 60.8604C130.25 60.9805 130.251 61.1009 130.251 61.2214M130.25 61.4504C128.083 41.1337 99.1 0.500244 0.5 0.500244M130.233 59.4582C126.969 38.5973 106.791 0.500244 48.5 0.500244M130.233 59.4582C129.456 20.9315 103.273 4.11179 88.25 0.500244M122.5 0.532227C125.167 5.95511 130.5 25.5081 130.5 60.3367M153.995 0.500244C146.251 2.76534 130.853 17.7487 130.501 59.528M130.501 59.528C130.497 59.9691 130.495 60.4133 130.495 60.8604M130.501 59.528C130.399 60.1867 130.314 60.8281 130.245 61.4504M130.501 59.528C130.504 59.5047 130.508 59.4814 130.512 59.4582M130.495 60.8604C130.495 60.9043 130.495 60.9482 130.495 60.9922M130.495 60.8604C130.497 60.3898 130.502 59.9224 130.512 59.4582M130.495 60.8604C130.494 60.9805 130.494 61.1009 130.494 61.2214M130.495 61.4504C132.661 41.1337 161.645 0.500244 260.245 0.500244M130.512 59.4582C133.776 38.5973 153.954 0.500244 212.245 0.500244M130.512 59.4582C131.289 20.9315 157.472 4.11179 172.495 0.500244M138.245 0.532227C135.578 5.95511 130.245 25.5081 130.245 60.3367" />
              </svg>

              {/* Layer 2: EKAM Execution Layer */}
              <div className="kalit-arch-layer kalit-arch-layer2">
                <div className="kalit-arch-logo">
                  <svg viewBox="0 0 82 82">
                    <title>EKAM AI — AI Platform</title>
                    <path
                      data-logo-id="kalit"
                      d="M71.8779 81.977C71.8779 64.9236 58.0534 51.0991 41 51.0991C23.9466 51.0991 10.1221 64.9236 10.1221 81.977V0.0436401M71.8779 0.0646362C71.8779 17.118 58.0534 30.9426 41 30.9426"
                      pathLength={2}
                      fill="none"
                    />
                  </svg>
                </div>
                <h3>EKAM Execution Layer</h3>
              </div>

              {/* Connector: layer2Line */}
              <svg viewBox="0 0 13 67" className="kalit-arch-layer2Line">
                <line x1="0.5" y1="0" x2="0.500003" y2="66" stroke="#91e500" />
                <line x1="4.5" y1="0" x2="4.5" y2="66" stroke="#12bcff" />
                <line x1="8.5" y1="0" x2="8.5" y2="66" stroke="#2f44ff" />
                <line x1="12.5" y1="0" x2="12.5" y2="66" stroke="#8200df" />
              </svg>

              {/* Layer 3: Running Systems */}
              <div className="kalit-arch-layer kalit-arch-layer3">
                <div className="kalit-arch-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 12 12"
                        to="360 12 12"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>
                <h3>Running Systems</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
