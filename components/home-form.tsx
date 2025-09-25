"use client";

import { Loader2, Play } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HomeForm() {
  const [word, setWord] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = word.trim();
    if (!value || isPlaying) {
      return;
    }

    setIsPlaying(true);
    try {
      const url = `/api/speak?word=${encodeURIComponent(value)}`;
      const audio = new Audio(url);
      await audio.play();
    } finally {
      setIsPlaying(false);
    }
  }

  const hasWord = word.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex justify-center items-center gap-4 mx-auto w-sm md:w-xl"
      aria-label="Listen to the pronunciation of any word"
      aria-busy={isPlaying}
    >
      <label htmlFor="word-input" className="sr-only">
        Word to pronounce
      </label>
      <Input
        id="word-input"
        value={word}
        onChange={(event) => setWord(event.target.value)}
        placeholder="Type a word"
        aria-describedby="word-helper"
        className="flex-1 disabled:opacity-80 px-2 py-2 focus-visible:ring-2 text-lg"
        disabled={isPlaying}
      />
      <Button
        type="submit"
        size="icon"
        variant="secondary"
        className={`size-10 cursor-pointer transition-transform ${
          isPlaying ? "animate-spin" : ""
        }`}
        disabled={!hasWord || isPlaying}
        aria-label={isPlaying ? "Playing pronunciation" : "Play pronunciation"}
      >
        {isPlaying ? (
          <Loader2 className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Play
            className={`h-6 w-6 ${hasWord ? "" : "text-muted-foreground"}`}
            aria-hidden="true"
          />
        )}
      </Button>
      <p id="word-helper" className="sr-only">
        Submit to hear the correct pronunciation instantly.
      </p>
    </form>
  );
}
