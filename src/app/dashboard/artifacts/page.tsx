"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/client-api";
import { PageHeader, SectionCard, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { Boxes, ChevronRight } from "lucide-react";

type Artifact = {
  runId: string;
  idx: number;
  title: string;
  type: "html" | "markdown" | "json" | "text";
  content: string;
  createdAt: string;
};

function prettyJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

function ArtifactContent({ artifact }: { artifact: Artifact }) {
  const { type, content } = artifact;
  if (type === "html") {
    return (
      <iframe
        srcDoc={content}
        sandbox="allow-same-origin"
        title={artifact.title}
        className="h-[400px] w-full rounded-lg border border-border"
      />
    );
  }
  if (type === "markdown") {
    return (
      <div className="text-sm [&_a]:text-[var(--color-3)] [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
  if (type === "json") {
    return <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{prettyJson(content)}</pre>;
  }
  return <p className="whitespace-pre-wrap text-sm">{content}</p>;
}

export default function ArtifactLibraryPage() {
  const [type, setType] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["artifacts", type],
    queryFn: () => api<{ artifacts: Artifact[] }>(`/api/dashboard/artifacts?type=${type}`),
  });

  const artifacts = data?.artifacts ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="Artifact library" description="Every output your agents have produced." />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {isError && (
        <EmptyState icon={Boxes} title="Couldn't load artifacts" description="Try refreshing the page." />
      )}

      {!isLoading && !isError &&
        (artifacts.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No artifacts yet"
            description="Outputs from your agent runs will show up here."
          />
        ) : (
          <div className="space-y-3">
            {artifacts.map((a) => {
              const key = `${a.runId}-${a.idx}`;
              const isOpen = !!open[key];
              return (
                <SectionCard key={key}>
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{a.title}</span>
                        <Badge variant="outline" className="uppercase text-[10px]">{a.type}</Badge>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Link
                          href={`/dashboard/agents/runs/${a.runId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[var(--color-3)] hover:underline"
                        >
                          View run
                        </Link>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-4">
                      <ArtifactContent artifact={a} />
                    </div>
                  )}
                </SectionCard>
              );
            })}
          </div>
        ))}
    </div>
  );
}
