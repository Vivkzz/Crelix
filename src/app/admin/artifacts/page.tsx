"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/client-api";
import { PageHeader, EmptyState, Spinner } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Boxes } from "lucide-react";

type Artifact = {
  runId: string;
  title: string;
  type: "html" | "markdown" | "json" | "text";
  content: string;
  createdAt: string;
  userEmail: string;
};

export default function AdminArtifactsPage() {
  const [type, setType] = useState("");
  const [user, setUser] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-artifacts", type, user],
    queryFn: () =>
      api<{ artifacts: Artifact[] }>(
        `/api/admin/artifacts?type=${type}&user=${encodeURIComponent(user)}`
      ),
  });

  const artifacts = data?.artifacts ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="All artifacts" description="Every artifact produced across all users." />

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
        <Input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Filter by user ID"
          className="w-72"
        />
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
            title="No artifacts found"
            description="Try adjusting your filters."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Run</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artifacts.map((a, i) => (
                <TableRow key={`${a.runId}-${i}`}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">{a.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.userEmail}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/agents/runs/${a.runId}`}
                      className="text-[var(--color-3)] hover:underline"
                    >
                      View run
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ))}
    </div>
  );
}
