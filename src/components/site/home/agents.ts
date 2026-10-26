import {
  PenLine,
  Palette,
  Code2,
  FlaskConical,
  ShieldCheck,
  Rocket,
  type LucideIcon,
} from "lucide-react";

/* The six build agents, in run order. Security runs before Deployer:
   nothing goes live unscanned. Each agent owns one hue (--ek-a1…a6). */
export type Agent = {
  key: string;
  name: string;
  role: string;
  file: string;
  out: string;
  /* what the agent is doing while it runs */
  doing: string;
  hue: string;
  ink: string;
  /* raw values for canvas drawing, which can't read CSS variables cheaply */
  rgb: [number, number, number];
  rgbDark: [number, number, number];
  icon: LucideIcon;
};

export const AGENTS: Agent[] = [
  { key: "planner", name: "Planner", role: "Scope & spec", file: "spec.md", out: "14 sections", doing: "writing spec", hue: "var(--ek-a1)", ink: "var(--ek-a1-ink)", rgb: [255, 159, 28], rgbDark: [255, 169, 58], icon: PenLine },
  { key: "designer", name: "Designer", role: "Brand & screens", file: "tokens.json", out: "tokens + 3 screens", doing: "choosing tokens", hue: "var(--ek-a2)", ink: "var(--ek-a2-ink)", rgb: [255, 77, 126], rgbDark: [255, 92, 138], icon: Palette },
  { key: "engineer", name: "Engineer", role: "Frontend & API", file: "BookingForm.tsx", out: "42 files · 9 routes", doing: "building routes", hue: "var(--ek-a3)", ink: "var(--ek-a3-ink)", rgb: [122, 92, 255], rgbDark: [140, 115, 255], icon: Code2 },
  { key: "tester", name: "Tester", role: "QA & a11y", file: "qa-report", out: "28 checks passed", doing: "running checks", hue: "var(--ek-a4)", ink: "var(--ek-a4-ink)", rgb: [28, 140, 255], rgbDark: [58, 155, 255], icon: FlaskConical },
  { key: "security", name: "Security", role: "Pre-launch scan", file: "scan.json", out: "11 classes · 0 open", doing: "probing 11 classes", hue: "var(--ek-a5)", ink: "var(--ek-a5-ink)", rgb: [15, 181, 174], rgbDark: [28, 207, 198], icon: ShieldCheck },
  { key: "deployer", name: "Deployer", role: "Ship & DNS", file: "deploy.log", out: "yourbrand.crelixai.com", doing: "shipping to edge", hue: "var(--ek-a6)", ink: "var(--ek-a6-ink)", rgb: [47, 191, 91], rgbDark: [61, 212, 110], icon: Rocket },
];

/* Six small dots in agent order. Used inline in copy and eyebrows. */
export const AGENT_HUES = AGENTS.map((a) => a.hue);
