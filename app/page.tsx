// src/app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [word, setWord] = useState('');

  async function speak() {
    if (!word) return;
    const url = `/api/speak?word=${encodeURIComponent(word)}`;
    const audio = new Audio(url);
    await audio.play();
  }

  return (
    <div style={{ padding: 50, textAlign: 'center' }}>
      <h2>即时报读</h2>
      <input
        type="text"
        value={word}
        placeholder="输入英文单词"
        onChange={e => setWord(e.target.value)}
        style={{ fontSize: 20, padding: 8, width: 300 }}
      />
      <div style={{ marginTop: 20 }}>
        <button onClick={speak} style={{ fontSize: 18, padding: '10px 20px' }}>
          🔊 发音
        </button>
      </div>
    </div>
  );
}
