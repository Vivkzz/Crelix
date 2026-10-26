import { generateLaunchPage } from "@/lib/integrations/flow";
import { runScan } from "@/lib/integrations/pentest";
import { runResearch } from "@/lib/integrations/search";

export type ToolName =
  | "web_search"
  | "web_fetch"
  | "research_topic"
  | "generate_page"
  | "run_scan"
  | "http_get";

export const ALL_TOOL_NAMES: ToolName[] = [
  "web_search",
  "web_fetch",
  "research_topic",
  "generate_page",
  "run_scan",
  "http_get",
];

export const TOOL_DEFINITIONS: { name: ToolName; description: string; parameters: object }[] = [
  {
    name: "web_search",
    description: "Search the web (DuckDuckGo + Hacker News) for current results.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "The search query." } },
      required: ["query"],
    },
  },
  {
    name: "web_fetch",
    description: "Fetch a URL and return its text content (truncated to ~4000 chars).",
    parameters: {
      type: "object",
      properties: { url: { type: "string", description: "The URL to fetch." } },
      required: ["url"],
    },
  },
  {
    name: "research_topic",
    description: "Run a market/competitive research report (Wikipedia, DuckDuckGo, GitHub, Hacker News).",
    parameters: {
      type: "object",
      properties: { topic: { type: "string", description: "The topic to research." } },
      required: ["topic"],
    },
  },
  {
    name: "generate_page",
    description: "Generate a launch/landing page HTML from a prompt.",
    parameters: {
      type: "object",
      properties: { prompt: { type: "string", description: "The product/launch prompt." } },
      required: ["prompt"],
    },
  },
  {
    name: "run_scan",
    description: "Run a security scan against a URL (headers, HTTPS, redirects).",
    parameters: {
      type: "object",
      properties: { target: { type: "string", description: "The target URL." } },
      required: ["target"],
    },
  },
  {
    name: "http_get",
    description: "Raw HTTP GET: status, headers, truncated body.",
    parameters: {
      type: "object",
      properties: { url: { type: "string", description: "The URL to GET." } },
      required: ["url"],
    },
  },
];

export function openaiToolSchemas(names: string[]): object[] {
  const out: object[] = [];
  for (const name of names) {
    const def = TOOL_DEFINITIONS.find((d) => d.name === name);
    if (!def) continue;
    out.push({
      type: "function",
      function: { name: def.name, description: def.description, parameters: def.parameters },
    });
  }
  return out;
}

export function anthropicToolSchemas(names: string[]): object[] {
  const out: object[] = [];
  for (const name of names) {
    const def = TOOL_DEFINITIONS.find((d) => d.name === name);
    if (!def) continue;
    out.push({ name: def.name, description: def.description, input_schema: def.parameters });
  }
  return out;
}

/** Flatten DuckDuckGo RelatedTopics (which may nest under {Topics}) into a flat list. */
function flattenTopics(
  topics: any[],
  out: { title: string; url: string; snippet: string }[] = [],
  limit = 8
): { title: string; url: string; snippet: string }[] {
  for (const t of topics) {
    if (out.length >= limit) break;
    if (t && Array.isArray(t.Topics)) {
      flattenTopics(t.Topics, out, limit);
    } else if (t && t.FirstURL) {
      const text: string = t.Text || "";
      const dash = text.indexOf(" - ");
      const title = dash > 0 ? text.slice(0, dash) : text.slice(0, 80) || t.FirstURL;
      out.push({
        title: title.slice(0, 120),
        url: `https://duckduckgo.com${t.FirstURL}`,
        snippet: text.slice(0, 160),
      });
    }
  }
  return out;
}

export async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "web_search": {
      try {
        const query = String(args?.query ?? "");
        const ddg = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`,
          { headers: { "User-Agent": "CrelixAI/1.0" } }
        );
        const dj: any = ddg.ok ? await ddg.json() : {};
        const results = flattenTopics(dj.RelatedTopics || []);
        const hn = await fetch(
          `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story`,
          { headers: { "User-Agent": "CrelixAI/1.0" } }
        );
        const hj: any = hn.ok ? await hn.json() : {};
        const news = (hj.hits || []).slice(0, 5).map((h: any) => ({
          title: h.title || h.story_title || "(HN story)",
          url: `https://news.ycombinator.com/item?id=${h.objectID}`,
          points: h.points || 0,
        }));
        return { query, results, news };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    case "web_fetch": {
      try {
        const url = String(args?.url ?? "");
        const res = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": "CrelixAI/1.0" },
        });
        const content = (await res.text()).slice(0, 4000);
        return { url, status: res.status, content };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    case "research_topic": {
      try {
        return await runResearch(String(args?.topic ?? ""));
      } catch (e: any) {
        return { error: e.message };
      }
    }
    case "generate_page": {
      try {
        const r = await generateLaunchPage(String(args?.prompt ?? ""));
        return { title: r.title, html: r.html, htmlLength: r.html.length };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    case "run_scan": {
      try {
        const scan = await runScan(String(args?.target ?? ""));
        return { target: scan.target, score: scan.score, summary: scan.summary, findings: scan.findings };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    case "http_get": {
      try {
        const url = String(args?.url ?? "");
        const res = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": "CrelixAI/1.0" },
        });
        return {
          status: res.status,
          headers: Object.fromEntries(res.headers),
          body: (await res.text()).slice(0, 2000),
        };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    default:
      return { error: "Unknown tool: " + name };
  }
}
