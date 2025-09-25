// src/app/api/speak/route.ts

import fs from "node:fs";
import TextToSpeech from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";

function getCredentials() {
  if (process.env.GCLOUD_TTS_CREDENTIALS_BASE64) {
    const json = Buffer.from(
      process.env.GCLOUD_TTS_CREDENTIALS_BASE64,
      "base64",
    ).toString("utf8");
    return JSON.parse(json);
  }
  if (process.env.GCLOUD_TTS_KEYFILE) {
    return JSON.parse(fs.readFileSync(process.env.GCLOUD_TTS_KEYFILE, "utf8"));
  }
  return undefined;
}

const client = new TextToSpeech.TextToSpeechClient({
  projectId: process.env.GCLOUD_TTS_PROJECT_ID,
  credentials: getCredentials(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");
  if (!word) {
    return NextResponse.json({ error: "word required" }, { status: 400 });
  }

  const [resp] = await client.synthesizeSpeech({
    input: { text: word },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  });

  if (!resp.audioContent) {
    return NextResponse.json({ error: "no audio generated" }, { status: 500 });
  }

  return new NextResponse(Buffer.from(resp.audioContent as Uint8Array), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
