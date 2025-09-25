"use client";

import { useCallback, useId, useMemo, useState } from "react";

import type { Word } from "@/app/types/word";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WordGalleryProps {
  words: Word[];
}

export function WordGallery({ words }: WordGalleryProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchInputId = useId();

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const word of words) {
      for (const tag of word.tags ?? []) {
        const normalized = tag.trim();
        if (normalized) {
          tags.add(normalized);
        }
      }
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [words]);

  const filteredWords = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return words.filter((word) => {
      const tags = word.tags ?? [];
      const matchesSearch =
        normalizedSearch.length === 0 ||
        word.word.toLowerCase().includes(normalizedSearch) ||
        word.definition.toLowerCase().includes(normalizedSearch);
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [searchValue, selectedTags, words]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const handlePlay = useCallback((value: string) => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(value);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            className="font-medium text-gray-700 dark:text-gray-200 text-sm"
            htmlFor={searchInputId}
          >
            Search words
          </label>
          <Input
            id={searchInputId}
            placeholder="Search by word or definition..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {availableTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => handleTagToggle(tag)}
                  aria-pressed={isActive}
                  className="cursor-pointer select-none"
                >
                  {tag}
                </Badge>
              );
            })}
            {selectedTags.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearTags}>
                Clear tags
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredWords.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No matching words found. Adjust the search filters or add new entries.
        </p>
      ) : (
        <div className="gap-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredWords.map((word) => (
            <Card key={word.id} className="flex flex-col h-full">
              <CardHeader className="flex justify-around pb-4">
                <CardTitle className="inline-block font-semibold capitalize">
                  {word.word}
                </CardTitle>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handlePlay(word.word)}
                  className="size-4"
                  aria-label={`Play ${word.word}`}
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    focusable="false"
                  >
                    <path d="M7 4.5v15l12-7.5-12-7.5z" />
                  </svg>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between gap-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {word.definition}
                </p>
                {word.tags.length > 0 && (
                  <div className="flex gap-1">
                    {word.tags.map((tag) => (
                      <Badge
                        key={`${word.id}-${tag}`}
                        variant="secondary"
                        className="cursor-default"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
