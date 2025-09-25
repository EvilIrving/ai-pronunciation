import { readWords } from "@/app/lib/fsdb";
import type { Word } from "@/app/types/word";
import { WordGallery } from "@/components/word-gallery";

const FALLBACK_WORDS: Word[] = [
  {
    id: "demo-serendipity",
    word: "serendipity",
    definition: "The occurrence of fortunate discoveries made by accident.",
    tags: ["noun", "positive"],
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "demo-eloquent",
    word: "eloquent",
    definition: "Fluent or persuasive in speaking or writing.",
    tags: ["adjective", "communication"],
    createdAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "demo-resilient",
    word: "resilient",
    definition:
      "Able to withstand or recover quickly from difficult conditions.",
    tags: ["adjective", "strength"],
    createdAt: "2024-01-03T00:00:00.000Z",
  },
  {
    id: "demo-clarity",
    word: "clarity",
    definition: "The quality of being easy to see, hear, or understand.",
    tags: ["noun", "communication"],
    createdAt: "2024-01-04T00:00:00.000Z",
  },
  {
    id: "demo-innovate",
    word: "innovate",
    definition: "To introduce changes and new ideas.",
    tags: ["verb", "action"],
    createdAt: "2024-01-05T00:00:00.000Z",
  },
];

export default async function Home() {
  const words = await readWords();
  const galleryWords = words.length > 0 ? words : FALLBACK_WORDS;

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            单词管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            使用搜索和标签快速浏览单词列表，点击播放按钮聆听发音。
          </p>
        </div>
        <WordGallery words={galleryWords} />
      </div>
    </main>
  );
}
