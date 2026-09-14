"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, ShieldAlert, FileJson, FileText, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  Spinner,
  BadgePill,
} from "@/components/dashboard/ui";
import { BarChartMini } from "@/components/dashboard/charts";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

type Scan = {
  id: string;
  userId: string;
  projectId?: string;
  targetUrl: string;
  status: string;
  findings?: string;
  score?: number | null;
  createdAt: string;
};

type Finding = {
  id: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  evidence?: string;
  remediation?: string;
};

type ParsedFindings = {
  target?: string;
  finalUrl?: string;
  scannedAt?: string;
  score?: number;
  summary?: { Critical?: number; High?: number; Medium?: number; Low?: number; Info?: number };
  findings?: Finding[];
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#f59e0b",
  Low: "#2563eb",
  Info: "#64748b",
};
const SEVERITIES = ["Critical", "High", "Medium", "Low", "Info"];

function sevColor(sev: string): string {
  return SEVERITY_COLORS[(sev || "").trim()] || "#64748b";
}

function downloadBlob(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function sanitize(s: string): string {
  return (s || "scan").replace(/[^\w.-]+/g, "_");
}

export default function ScanDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["scan", id],
    queryFn: () => api<{ scan: Scan }>(`/api/dashboard/scans/${id}`),
    enabled: !!id,
  });

  const scan = data?.scan;

  const parsed = useMemo<ParsedFindings | null>(() => {
    if (!scan?.findings) return null;
    try {
      return JSON.parse(scan.findings) as ParsedFindings;
    } catch {
      return null;
    }
  }, [scan]);

  const findings = parsed?.findings ?? [];
  const summary = parsed?.summary ?? {};
  const score = parsed?.score ?? scan?.score ?? null;
  const target = parsed?.target || scan?.targetUrl || "scan";

  const summaryData = SEVERITIES.map((s) => ({
    label: s.replace("Critical", "Crit").replace("Medium", "Med"),
    value: summary[s as keyof typeof summary] ?? 0,
  }));

  const delM = useMutation({
    mutationFn: () => api(`/api/dashboard/scans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Scan deleted");
      qc.invalidateQueries({ queryKey: ["scans"] });
      router.push("/dashboard/scans");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  function exportJson() {
    downloadBlob(
      `${sanitize(target)}.json`,
      JSON.stringify(parsed || { target }, null, 2),
      "application/json"
    );
  }
  function exportCsv() {
    const header = ["id", "severity", "category", "title", "description"];
    const rows = findings.map((f) =>
      [f.id, f.severity, f.category, f.title, f.description].map(csvCell).join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    downloadBlob(`${sanitize(target)}.csv`, csv, "text/csv");
  }
  function exportHtml() {
    const body = findings
      .map(
        (f) => `<li style="margin-bottom:12px"><strong style="color:${sevColor(f.severity)}">${f.severity}</strong> · ${f.category} — ${escapeHtml(
          f.title
        )}<br/><span>${escapeHtml(f.description)}</span></li>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Scan report — ${escapeHtml(
      target
    )}</title><style>body{font-family:-apple-system,system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}h1{font-size:20px}code{background:#f4f4f5;padding:2px 6px;border-radius:4px}</style></head><body>
<h1>Scan report</h1>
<p><strong>Target:</strong> ${escapeHtml(target)}<br/>
<strong>Final URL:</strong> ${escapeHtml(parsed?.finalUrl || "—")}<br/>
<strong>Scanned:</strong> ${parsed?.scannedAt || ""}<br/>
<strong>Score:</strong> ${score ?? "—"}</p>
<h2>Severity summary</h2>
<p>${SEVERITIES.map((s) => `${s}: ${summary[s as keyof typeof summary] ?? 0}`).join(" · ")}</p>
<h2>Findings (${findings.length})</h2>
<ul style="list-style:none;padding:0">${body}</ul>
</body></html>`;
    downloadBlob(`${sanitize(target)}.html`, html, "text/html");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader
        title="Scan report"
        description={scan?.targetUrl || "Security scan results."}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/scans">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => delM.mutate()} disabled={delM.isPending || !scan}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load scan."}
        </p>
      ) : !scan ? (
        <EmptyState icon={ShieldAlert} title="Scan not found" />
      ) : !parsed ? (
        <SectionCard title="Summary">
          <p className="text-sm text-muted-foreground">
            {scan.status && scan.status.toLowerCase() !== "complete"
              ? `Scan is ${scan.status}. Results will appear here once complete.`
              : "No findings data available for this scan."}
          </p>
        </SectionCard>
      ) : (
        <>
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SectionCard className="lg:col-span-1">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</div>
              <div
                className="mt-1.5 text-4xl font-semibold tracking-tight"
                style={{ color: score != null ? (score >= 80 ? "var(--color-1)" : score >= 50 ? "#f59e0b" : "var(--color-5)") : undefined }}
              >
                {score ?? "—"}
              </div>
            </SectionCard>
            <SectionCard className="lg:col-span-3" title="Severity summary">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map((s) => (
                    <BadgePill key={s} color={sevColor(s)}>
                      {s} · {summary[s as keyof typeof summary] ?? 0}
                    </BadgePill>
                  ))}
                </div>
                <BarChartMini data={summaryData} dataKey="value" xKey="label" color="var(--color-3)" />
              </div>
            </SectionCard>
          </div>

          {/* Details */}
          <SectionCard title="Scan details">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Target</dt>
                <dd className="font-medium break-all">{parsed.target || scan.targetUrl}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Final URL</dt>
                <dd className="font-medium break-all">{parsed.finalUrl || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Scanned at</dt>
                <dd className="font-medium">
                  {parsed.scannedAt
                    ? format(new Date(parsed.scannedAt), "PPpp")
                    : format(new Date(scan.createdAt), "PPpp")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd><BadgePill>{scan.status || "complete"}</BadgePill></dd>
              </div>
            </dl>
          </SectionCard>

          {/* Export */}
          <SectionCard title="Export" description="Download this scan in different formats.">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportJson}>
                <FileJson className="h-4 w-4" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportHtml}>
                <FileText className="h-4 w-4" />
                HTML report
              </Button>
            </div>
          </SectionCard>

          {/* Findings */}
          <SectionCard title={`Findings (${findings.length})`} description="Issues detected during the scan.">
            {findings.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No findings" description="This scan did not detect any issues." />
            ) : (
              <div className="space-y-3">
                {findings.map((f) => (
                  <div key={f.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <BadgePill color={sevColor(f.severity)}>{f.severity}</BadgePill>
                      <BadgePill>{f.category}</BadgePill>
                      <span className="text-sm font-semibold">{f.title}</span>
                    </div>
                    {f.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                    )}
                    {f.evidence && (
                      <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                        {f.evidence}
                      </pre>
                    )}
                    {f.remediation && (
                      <p className="mt-2 text-sm">
                        <span className="font-medium text-foreground">Fix: </span>
                        <span className="text-muted-foreground">{f.remediation}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}

function escapeHtml(s: string): string {
  return (s || "").replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}
