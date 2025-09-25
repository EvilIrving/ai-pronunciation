import type { Metadata } from "next";

import { HomeForm } from "@/components/home-form";

export const metadata: Metadata = {
  title: "Instant AI Word Pronunciation",
  description:
    "Type any English word and hear a studio-quality Google Cloud Text-to-Speech pronunciation in seconds.",
};

export default function HomePage() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      {/* <section className="flex flex-col items-center gap-12 md:gap-16 mx-auto px-6 pt-24 md:pt-32 pb-24 w-full max-w-5xl text-center">
        <div className="flex flex-col items-center gap-6 max-w-3xl">
          <p className="text-emerald-400 text-sm uppercase tracking-[0.4em]">
            AI-Powered Dictionary Companion
          </p>
          <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl text-balance leading-tight">
            Master every pronunciation with crystal clear Google Text-to-Speech
            audio
          </h1>
          <p className="max-w-2xl text-neutral-200 text-base sm:text-lg text-balance">
            Words instantly transforms any term into a natural sounding voice
            clip using Google Cloud Text-to-Speech. Perfect your accent, prepare
            presentations, or help learners hear the correct articulation
            without installing anything.
          </p>
        </div> */}
        <HomeForm />
        {/* <div className="gap-8 grid md:grid-cols-3 w-full max-w-4xl text-left">
          <div className="bg-white/5 backdrop-blur p-6 border border-white/10 rounded-xl">
            <h2 className="font-semibold text-white text-lg">
              Studio-grade clarity
            </h2>
            <p className="mt-3 text-neutral-200 text-sm">
              Google Cloud neural voices deliver lifelike pronunciation so you
              can hear syllable stress, rhythm, and tone just like native
              speakers.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur p-6 border border-white/10 rounded-xl">
            <h2 className="font-semibold text-white text-lg">
              Instant playback
            </h2>
            <p className="mt-3 text-neutral-200 text-sm">
              Forget downloads. Simply enter a word and stream the audio in your
              browser within a second, even on slower connections.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur p-6 border border-white/10 rounded-xl">
            <h2 className="font-semibold text-white text-lg">
              Ideal for educators
            </h2>
            <p className="mt-3 text-neutral-200 text-sm">
              Use Words in classrooms, tutoring sessions, or language labs to
              reinforce correct pronunciation for every learner.
            </p>
          </div>
        </div>
        <div className="space-y-6 w-full max-w-3xl text-left">
          <h2 className="font-semibold text-2xl">How it works</h2>
          <ol className="space-y-3 pl-4 text-neutral-200 text-sm sm:text-base list-decimal">
            <li>Enter any word in English into the pronunciation bar above.</li>
            <li>
              Words sends it securely to our pronunciation API powered by Google
              Cloud Text-to-Speech.
            </li>
            <li>
              Hear a natural, high fidelity voice pronounce the word instantly
              and repeat as often as needed.
            </li>
          </ol>
        </div>
      </section> */}
    </main>
  );
}
