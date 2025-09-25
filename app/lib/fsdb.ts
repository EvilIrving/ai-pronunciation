import { promises as fs } from "node:fs";
import path from "node:path";
import { type Word, WordsArraySchema } from "@/app/types/word";

const DATA_DIR = path.join(process.cwd(), "app", "data");
const WORDS_PATH = path.join(DATA_DIR, "words.json");

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(WORDS_PATH);
  } catch {
    await fs.writeFile(WORDS_PATH, "[]", "utf-8");
  }
}

export async function readWords(): Promise<Word[]> {
  await ensureDataFile();
  const raw = await fs.readFile(WORDS_PATH, "utf-8");
  const parsed = JSON.parse(raw || "[]");
  return WordsArraySchema.parse(parsed);
}

export async function writeWords(words: Word[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(WORDS_PATH, JSON.stringify(words, null, 2), "utf-8");
}

export async function addWord(word: Word): Promise<void> {
  const words = await readWords();
  words.push(word);
  await writeWords(words);
}

export async function updateWord(
  id: string,
  patch: Partial<Word>,
): Promise<Word | null> {
  const words = await readWords();
  const idx = words.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const updated = { ...words[idx], ...patch } as Word;
  words[idx] = updated;
  await writeWords(words);
  return updated;
}

export async function deleteWord(id: string): Promise<boolean> {
  const words = await readWords();
  const next = words.filter((w) => w.id !== id);
  const changed = next.length !== words.length;
  if (changed) await writeWords(next);
  return changed;
}
