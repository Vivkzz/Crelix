import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/guards";
import { db } from "@/lib/db";

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await db.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = (body.title ?? "").toString().trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const provided = (body.slug ?? "").toString().trim();
  let base = provided || slugify(title);
  if (!base) base = "post";

  let slug = base;
  while (await db.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }

  const post = await db.blogPost.create({
    data: {
      slug,
      title,
      excerpt: body.excerpt ?? null,
      content: body.content ?? null,
      category: body.category ?? null,
      author: body.author ?? null,
      published: body.published !== undefined ? !!body.published : false,
    },
  });

  await audit(admin.id, "blog.create", "BlogPost", post.id);
  return NextResponse.json({ post });
}
