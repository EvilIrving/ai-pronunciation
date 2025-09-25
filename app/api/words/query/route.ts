import { NextResponse } from "next/server";
import { z } from "zod";
import { readWords } from "@/app/lib/fsdb";

const QuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  tags: z.string().trim().min(1).optional(), // comma-separated
  tagsMode: z.enum(["any", "all"]).optional().default("any"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.parse({
      q: searchParams.get("q") || undefined,
      tags: searchParams.get("tags") || undefined,
      tagsMode: (searchParams.get("tagsMode") as "any" | "all") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const all = await readWords();

    const tags = parsed.tags
      ? parsed.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const q = parsed.q?.toLowerCase();

    let filtered = all;

    if (tags.length > 0) {
      filtered = filtered.filter((w) => {
        const set = new Set(w.tags.map((t) => t.toLowerCase()));
        const want = tags.map((t) => t.toLowerCase());
        if (parsed.tagsMode === "all") {
          return want.every((t) => set.has(t));
        }
        return want.some((t) => set.has(t));
      });
    }

    if (q) {
      filtered = filtered.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q),
      );
    }

    // simple stable sort by createdAt desc
    filtered = filtered
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const total = filtered.length;
    const start = (parsed.page - 1) * parsed.limit;
    const items = filtered.slice(start, start + parsed.limit);

    return NextResponse.json({
      items,
      total,
      page: parsed.page,
      limit: parsed.limit,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
