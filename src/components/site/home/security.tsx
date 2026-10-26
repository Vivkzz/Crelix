"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/components/shared/use-reduced-motion";
import { Section, Eyebrow } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { owaspClasses } from "@/lib/data/site";

const findings = [
  {
    sev: "high",
    label: "High",
    title: "Reflected XSS in search endpoint",
    ev: 'GET /api/search?q=<svg onload=…> → 200 · unescaped reflection',
  },
  {
    sev: "medium",
    label: "Medium",
    title: "Missing rate limit on login",
    ev: "POST /api/auth/login · 1,000 req/10s · no 429",
  },
  {
    sev: "low",
    label: "Low",
    title: "Verbose error in production",
    ev: "GET /api/users/{id} · stack trace leaks paths",
  },
  {
    sev: "info",
    label: "Info",
    title: "Missing security headers",
    ev: "CSP, X-Frame-Options, Referrer-Policy absent",
  },
];

export function FindingsReport() {
  const reduce = useReducedMotionSafe();
  return (
    <div className="ek-report ek-glass">
      <div className="ek-report-head">
        <span>target: yourbrand.ekamai.app</span>
        <span>2026-10-25</span>
        <span>12 agents</span>
        <span>4m 12s</span>
      </div>
      {findings.map((f, i) => (
        <motion.div
          key={f.title}
          className="ek-report-row"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={`ek-chip ${f.sev}`}>{f.label}</span>
          <div>
            <div className="ek-report-title">{f.title}</div>
            <div className="ek-report-ev">{f.ev}</div>
          </div>
        </motion.div>
      ))}
      <div className="ek-report-foot">
        <span aria-hidden="true">✓</span> 11 vulnerability classes checked
      </div>
    </div>
  );
}

export function Security() {
  return (
    <div className="ek-security-band">
      <Section id="security">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow><span className="ek-security-eyebrow">Before go-live</span></Eyebrow>
            <h2 className="ek-h2 mt-6">
              Ship it. Then let it be seen.
            </h2>
            <p className="ek-bodytext mt-6">
              Every launch gets an authorized pre-launch scan: twelve security
              specialists covering the OWASP classes, on targets you own. Findings
              come back with evidence, severity and remediation guidance before
              you drive a single visitor.
            </p>
            <p className="ek-bodytext mt-4">
              Authorized scans only. No exceptions. It's in the terms, and it's
              in the product.
            </p>
          </div>
          <Reveal delay={120}>
            <FindingsReport />
          </Reveal>
        </div>
      </Section>
      <div className="ek-marquee" aria-hidden="true">
        <div className="ek-marquee-inner">
          {[...owaspClasses, ...owaspClasses].map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
