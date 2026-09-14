"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Building2, Clock, ArrowRight, Check, Send } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { AnimatedBackground } from "@/components/shared/animated-background";

const reasons = [
  { id: "sales", label: "Sales — pricing, plans, demos", icon: Mail },
  { id: "support", label: "Support — help with a project", icon: MessageSquare },
  { id: "agency", label: "Agency / partner program", icon: Building2 },
  { id: "other", label: "Something else", icon: ArrowRight },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState("sales");

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
        <AnimatedBackground variant="default" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-linear-3)" }} />
              Contact
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1
              className="mt-4 font-semibold tracking-tight"
              style={{ fontSize: "clamp(40px, 3.5vw + 28px, 64px)", lineHeight: 1.05 }}
            >
              <span className="text-spectrum-animated">Let's talk.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-pretty text-muted-foreground text-lg">
              Sales, support, partnerships, or just curious — we read every message.
            </p>
          </Reveal>
        </div>
      </section>

      <Section className="!pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <Reveal>
            <div className="rounded-2xl border border-border bg-white/80 p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                    style={{
                      background: "var(--gradient-linear-3)",
                      backgroundSize: "200% auto",
                      animation: "spectrum-pan 6s linear infinite",
                    }}
                  >
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight">Message sent</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-pill-outline mt-6"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      What's this about?
                    </label>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {reasons.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setReason(r.id)}
                          className={
                            "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all " +
                            (reason === r.id
                              ? "border-foreground/15 bg-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)]"
                              : "border-border bg-white/60 hover:border-foreground/15")
                          }
                        >
                          <r.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" name="name" placeholder="Jane Doe" required />
                    <Field label="Email" name="email" type="email" placeholder="jane@company.com" required />
                  </div>

                  <Field label="Company (optional)" name="company" placeholder="Acme Inc." />

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us what you're working on..."
                      className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  </div>

                  <button type="submit" className="btn-pill w-full">
                    Send message
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Contact info */}
          <Reveal delay={120}>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-white/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email us</div>
                    <a href="mailto:contact@ekamai.in" className="text-sm font-medium hover:text-foreground/80">
                      contact@ekamai.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-foreground">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Office</div>
                    <div className="text-sm font-medium">GIFT City, Gandhinagar, India</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-foreground">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Response time</div>
                    <div className="text-sm font-medium">Within 24 hours, Mon–Fri</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#f2f1f1]/60 p-6">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Looking for support?
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  For faster help with an existing project, use the in-app chat.
                  Most issues get a first response in under 2 hours.
                </p>
                <Link href="/dashboard" className="btn-pill-outline mt-4 w-full">
                  Open dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />
    </div>
  );
}
