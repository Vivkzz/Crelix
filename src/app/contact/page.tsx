"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Building2, ArrowRight, Check, Send } from "lucide-react";
import { SiteLayout } from "@/components/shared/site-layout";
import { Section, Eyebrow } from "@/components/shared/section";
import { Reveal, SplitReveal } from "@/components/shared/reveal";

const reasons = [
  { id: "sales", label: "Sales, pricing, plans, demos", icon: Mail },
  { id: "support", label: "Support, help with a project", icon: MessageSquare },
  { id: "agency", label: "Agency / partner program", icon: Building2 },
  { id: "other", label: "Something else", icon: ArrowRight },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState("sales");

  return (
    <SiteLayout>
      <Section className="!pt-[160px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: title + direct details */}
          <div>
            <Reveal>
              <Eyebrow>Contact</Eyebrow>
            </Reveal>
            <SplitReveal
              as="h1"
              className="ek-h1-page mt-6"
              lines={["Tell us what you're", "building."]}
            />
            <Reveal delay={200}>
              <p className="ek-lead mt-6" style={{ maxWidth: "40ch" }}>
                Sales, support, partnerships, or just curious. We read every
                message.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-10" style={{ borderTop: "1px solid var(--ek-line)" }}>
                {[
                  { label: "Email", value: "contact@ekamai.in", href: "mailto:contact@ekamai.in" },
                  { label: "Office", value: "GIFT City, Gandhinagar, India" },
                  { label: "Response", value: "Within 24 hours, Mon–Fri" },
                ].map((c) => (
                  <div key={c.label} className="ek-numlist-item" style={{ gridTemplateColumns: "110px 1fr" }}>
                    <span className="text-[14px] font-semibold" style={{ color: "var(--ek-ink-2)" }}>
                      {c.label}
                    </span>
                    {c.href ? (
                      <a href={c.href} className="t" style={{ color: "var(--ek-accent)" }}>{c.value}</a>
                    ) : (
                      <span className="t">{c.value}</span>
                    )}
                    <span />
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={360}>
              <p className="mt-8 text-[13px] leading-relaxed" style={{ color: "var(--ek-ink-3)" }}>
                Existing project? Use the{" "}
                <Link href="/dashboard" style={{ color: "var(--ek-ink)", textDecoration: "underline" }}>
                  in-app chat
                </Link>{" "}
                Most issues get a first response in under 2 hours.
              </p>
            </Reveal>
          </div>

          {/* Right: form in glass panel — same fields/validation/submit as before, restyled */}
          <Reveal delay={160}>
            <div className="ek-glass p-6 sm:p-9" style={{ borderRadius: "var(--ek-r-lg)" }}>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ border: "1px solid var(--ek-line-strong)" }}
                  >
                    <Check className="h-7 w-7" style={{ color: "var(--ek-green)" }} />
                  </div>
                  <h3 className="ek-serif mt-6 text-3xl" style={{ color: "var(--ek-ink)" }}>Message sent</h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--ek-ink-2)" }}>
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="ek-btn-ghost mt-7"
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
                >
                  <div className="ek-cap">What's this about?</div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {reasons.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setReason(r.id)}
                        className={"ek-reason" + (reason === r.id ? " active" : "")}
                      >
                        <r.icon className="h-4 w-4" style={{ color: "var(--ek-ink-3)" }} aria-hidden="true" />
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-7 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    <Field label="Name" name="name" placeholder="Jane Doe" required />
                    <Field label="Email" name="email" type="email" placeholder="jane@company.com" required />
                  </div>

                  <div className="mt-2">
                    <Field label="Company (optional)" name="company" placeholder="Acme Inc." />
                  </div>

                  <div className="ek-field mt-2">
                    <textarea
                      required
                      rows={5}
                      name="message"
                      placeholder="Tell us what you're working on..."
                    />
                    <label>Message</label>
                  </div>

                  <button type="submit" className="ek-btn mt-8 w-full" style={{ justifyContent: "center" }}>
                    Send message
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              )}
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
    <div className="ek-field">
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
      />
      <label>{label}</label>
    </div>
  );
}
