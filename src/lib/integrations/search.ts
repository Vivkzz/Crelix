// EKAM AI Search — keyless market research. Wikipedia REST + DuckDuckGo
// Instant Answer + Hacker News (Algolia). No API keys required.

export type ResearchResult = {
  topic: string;
  summary: string;
  competitors: { name: string; url: string; snippet: string }[];
  keywords: string[];
  sources: { title: string; url: string; source: string }[];
  news: { title: string; url: string; points: number }[];
  markdown: string;
};

function timeout(ms: number) {
  return AbortSignal.timeout(ms);
}

export async function runResearch(topic: string): Promise<ResearchResult> {
  const t = topic.trim();
  const sources: ResearchResult["sources"] = [];
  const competitors: ResearchResult["competitors"] = [];
  const news: ResearchResult["news"] = [];
  let summary = "";

  // 1. Wikipedia REST summary
  try {
    const title = encodeURIComponent(t.split(/\s+/).slice(0, 4).join(" "));
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
      signal: timeout(10000),
    });
    if (r.ok) {
      const j: any = await r.json();
      if (j.extract) summary = j.extract as string;
      if (j.content_urls?.desktop?.page) {
        sources.push({ title: j.title || t, url: j.content_urls.desktop.page, source: "Wikipedia" });
      }
    }
  } catch {
    /* offline / not found */
  }

  // 2. DuckDuckGo Instant Answer
  try {
    const r = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(t)}&format=json&no_html=1&skip_disambig=1`,
      { signal: timeout(10000) }
    );
    if (r.ok) {
      const j: any = await r.json();
      if (j.AbstractText && !summary) summary = j.AbstractText;
      const related = (j.RelatedTopics || []).filter((x: any) => x.FirstURL).slice(0, 6);
      for (const rt of related) {
        const url = `https://duckduckgo.com${rt.FirstURL}`;
        const text: string = rt.Text || t;
        sources.push({ title: text.slice(0, 80) || t, url, source: "DuckDuckGo" });
        competitors.push({ name: text.split(" - ")[0].slice(0, 60) || "Result", url, snippet: text.slice(0, 160) });
      }
    }
  } catch {
    /* offline */
  }

  // 3. Hacker News via Algolia
  try {
    const r = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(t)}&tags=story&hitsPerPage=6`,
      { signal: timeout(10000) }
    );
    if (r.ok) {
      const j: any = await r.json();
      for (const h of j.hits || []) {
        const url: string = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
        const title: string = h.title || h.story_title || "(HN story)";
        news.push({ title, url, points: h.points || 0 });
        sources.push({ title, url, source: "Hacker News" });
      }
    }
  } catch {
    /* offline */
  }

  const keywords = Array.from(
    new Set(t.toLowerCase().split(/\s+/).filter((w) => w.length > 2))
  ).slice(0, 8);
  if (!summary) summary = `No concise encyclopedia summary found for "${t}". The scan pulled related results and recent discussion below.`;

  const markdown = buildMarkdown({ topic: t, summary, competitors, keywords, sources, news });
  return { topic: t, summary, competitors, keywords, sources, news, markdown };
}

function buildMarkdown(r: ResearchResult): string {
  return `# Market research: ${r.topic}

## Summary
${r.summary}

## Keywords
${r.keywords.map((k) => `- ${k}`).join("\n")}

## Related & competitors
${r.competitors.slice(0, 6).map((c) => `- [${c.name}](${c.url}) — ${c.snippet}`).join("\n")}

## Recent discussion (Hacker News)
${r.news.slice(0, 6).map((n) => `- [${n.title}](${n.url}) (${n.points} pts)`).join("\n")}

## Sources
${r.sources.slice(0, 12).map((s) => `- [${s.source}] ${s.title} — ${s.url}`).join("\n")}
`;
}
