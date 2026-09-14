"use client";

/**
 * Vichar logo — direct port of kalit.ai's logo-module
 * Multi-path SVG with stroke-dashoffset drawing animation.
 * Each path has pathLength="2" and animates from dashoffset:2 to dashoffset:0
 * when the parent gets data-logo-active={suite}.
 *
 * Paths (exact from kalit.ai):
 *  - kalit     : default platform mark
 *  - pentest   : color-1 (lime)
 *  - flow      : color-2 (cyan)
 *  - marketing : color-3 (blue)
 *  - search    : color-5 (magenta)
 */

export type LogoSuite = "default" | "pentest" | "flow" | "marketing" | "search";

const PATHS = {
  kalit:
    "M71.8779 81.977C71.8779 64.9236 58.0534 51.0991 41 51.0991C23.9466 51.0991 10.1221 64.9236 10.1221 81.977V0.0436401M71.8779 0.0646362C71.8779 17.118 58.0534 30.9426 41 30.9426",
  pentest:
    "M20.366 10.1298H30.6829C42.0383 10.1298 51.2437 19.3351 51.2437 30.6906C51.2437 42.046 42.0383 51.2513 30.6829 51.2513C19.3274 51.2513 10.1221 42.046 10.1221 30.6906V82.0436",
  flow:
    "M61.3701 10.5157H40.9951C16.2951 10.5157 10.1201 31.099 10.1201 41.3907V81.9811M40.9951 50.7657H61.3701",
  marketing:
    "M71.751 0C71.751 17.0534 57.9265 30.8779 40.873 30.8779C23.8196 30.8779 9.99512 17.0534 9.99512 0V81.9811M71.7665 36.1279L71.6221 81.9124",
  search:
    "M30.5918 30.4995C30.5918 19.1779 39.7697 10 51.0913 10C62.4129 10 71.5908 19.1779 71.5908 30.4995C71.5908 41.8211 62.4129 50.999 51.0913 50.999L30.6721 50.999L7.07098 74.6001",
};

const PATH_COLORS: Record<string, string> = {
  kalit: "var(--text)",
  pentest: "var(--color-1)",
  flow: "var(--color-2)",
  marketing: "var(--color-3)",
  search: "var(--color-5)",
};

export function VicharLogo({
  active = "default",
  size = 28,
  className = "",
  showAll = false,
}: {
  active?: LogoSuite;
  size?: number;
  className?: string;
  showAll?: boolean;
}) {
  // Map "default" suite -> "kalit" path id
  const activePathId = active === "default" ? "kalit" : active;

  // When showAll is true, render every path (like the Product Family mega-logo)
  // Otherwise, render only the active path
  const pathsToShow = showAll
    ? Object.entries(PATHS)
    : Object.entries(PATHS).filter(([id]) => id === activePathId);

  return (
    <svg
      viewBox="0 0 82 82"
      width={size}
      height={size}
      className={`vichar-logo ${showAll ? "show-all" : ""} ${className}`}
      data-logo-active={active}
      fill="none"
      aria-hidden="true"
    >
      {pathsToShow.map(([id, d]) => (
        <path
          key={id}
          data-logo-id={id}
          d={d}
          pathLength={2}
          style={{ ["--color" as string]: PATH_COLORS[id] }}
        />
      ))}
    </svg>
  );
}
