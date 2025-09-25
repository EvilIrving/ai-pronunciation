 # Dictionary App


单词→查询缓存→字典API→R2音频→入库；一次生成，多次复用。


## 快速开始
 
3. `pnpm i && pnpm dev`


## 关键接口
- GET /api/words/[word]
- POST /api/admin/add { words: string[] }


## 依赖服务
- Supabase 
- Cloudflare R2 (S3)
- Google Cloud Text‑to‑Speech

# Dictionary App — Implementation Blueprint (Next.js 14+ App Router)

> KISS：最小化依赖、清晰的数据流、一次生成多次复用。

---

## 0) Tech Stack & Packages

* Runtime: Node 18+/20+
* Framework: Next.js 15+ (App Router)
* DB: Supabase
* Storage (audio): Cloudflare R2 (S3 兼容)
* TTS: Google Cloud Text‑to‑Speech
* HTTP: `fetch` (内置)
* SDKs: `@supabase/supabase-js`, `@google-cloud/text-to-speech`, `@aws-sdk/client-s3`
* Utils: `zod`（入参/响应校验，避免脏数据）

```json
// package.json
{
  "name": "dictionary-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "@aws-sdk/client-s3-control": "^3.896.0",
    "@google-cloud/text-to-speech": "^6.3.0",
    "@supabase/supabase-js": "^2.57.4",
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "zod": "^4.1.11"
  },
}
```

```bash
# .env.example（不要提交到仓库）
# Next.js
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=

# R2 (S3 兼容)
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_REGION=auto
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=dictionary-audio
R2_PUBLIC_BASE=https://cdn.example.com  # 你的 CDN 域名（CNAME 到 R2/CF CDN）

# Google Cloud TTS（使用 SA JSON 的 Base64 或文件路径二选一）
GCLOUD_TTS_PROJECT_ID=
GCLOUD_TTS_CREDENTIALS_BASE64=  # 将 service-account.json Base64 后放入
# 或者：GCLOUD_TTS_KEYFILE=/absolute/path/to/service-account.json
```

## API: /api/words/query

- Method: `GET`
- Query params:
  - `q`: 关键词，匹配 word/definition（不区分大小写）
  - `tags`: 逗号分隔标签，如 `tags=verb,common`
  - `tagsMode`: `any`(默认)｜`all`（任一/全部标签匹配）
  - `page`: 页码，默认 1
  - `limit`: 页大小，1–100，默认 20
- Response:
  ```json
  {
    "items": [ { "id": "uuid", "word": "...", "definition": "...", "tags": ["..."], "createdAt": "ISO" } ],
    "total": 0,
    "page": 1,
    "limit": 20
  }
  ```
- 存储：`app/data/words.json`（文件系统）。


---

## 1) Database (Supabase)

```sql
-- supabase/schema.sql
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  phonetic text,
  definition jsonb,
  examples jsonb,
  audio_url text,
  tags text[] default '{}',
  first_letter char(1) generated always as (substr(lower(word), 1, 1)) stored,
  source text check (source in ('dictionaryapi', 'gcloud-tts')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 更新触发器
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger words_set_updated_at
before update on public.words
for each row execute procedure public.set_updated_at();

-- 基础索引
create index if not exists idx_words_word on public.words (word);
create index if not exists idx_words_first_letter on public.words (first_letter);
create index if not exists idx_words_tags on public.words using gin (tags);
```

> RLS：对公开只读查询可以不开 RLS；如需登录/写入，开启 RLS 并用 Service Role 在 API Route 中写库。

---

## 2) Project Structure

```
src/
  app/
    api/
      words/
        [word]/route.ts
      admin/
        add/route.ts           # 可选：批量导入
  lib/
    supabase.ts
    r2.ts
    tts.ts
    dictionary.ts
  types/
    word.ts
supabase/
  schema.sql
.env.example
package.json
```

---

## 3) Types

```ts
// src/types/word.ts
import { z } from 'zod';

export const WordResponseSchema = z.object({
  word: z.string(),
  phonetic: z.string().optional().nullable(),
  definition: z.array(z.any()).optional(),
  examples: z.array(z.any()).optional(),
  audio_url: z.string().url().optional().nullable()
});
export type WordResponse = z.infer<typeof WordResponseSchema>;
```

---

## 4) Supabase Client

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE; // server only

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseService = serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : supabaseClient; // fallback; 写入建议用 service role
```

---

## 5) R2 (S3) Client & Upload

```ts
// src/lib/r2.ts
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  },
  forcePathStyle: true
});

const BUCKET = process.env.R2_BUCKET!;
const PUBLIC_BASE = (process.env.R2_PUBLIC_BASE || '').replace(/\/$/, '');

export function audioKey(word: string) {
  // 统一小写 + URI 安全
  const safe = encodeURIComponent(word.trim().toLowerCase());
  return `audio/${safe}.mp3`;
}

export async function ensureObjectExists(key: string) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function putAudio(key: string, body: Buffer | Uint8Array) {
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: 'audio/mpeg',
      CacheControl: 'public, max-age=31536000, immutable'
    })
  );
  return `${PUBLIC_BASE}/${key}`;
}
```

---

## 6) Dictionary API Fetch & Normalize

```ts
// src/lib/dictionary.ts
const BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

type DictEntry = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: any[];
};

export async function fetchFromDictionaryApi(word: string) {
  const url = `${BASE}/${encodeURIComponent(word)}`;
  const res = await fetch(url, { next: { revalidate: 0 } }); // 不缓存第三方
  if (!res.ok) return null;
  const data = (await res.json()) as DictEntry[];
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0];
  // 选一个最可能的 phonetic
  const phonetic = first.phonetic || first.phonetics?.find(p => p.text)?.text || null;
  const audio = first.phonetics?.find(p => p.audio)?.audio || null;

  return {
    word: first.word || word,
    phonetic,
    meanings: data.flatMap(d => d.meanings || []),
    exampleCandidates: data // 取所有 meanings 里的例句
      .flatMap(d => (d.meanings || []))
      .flatMap((m: any) => (m.definitions || []))
      .map((def: any) => def.example)
      .filter(Boolean),
    audio
  } as const;
}
```

---

## 7) Google TTS Wrapper

```ts
// src/lib/tts.ts
import TextToSpeech from '@google-cloud/text-to-speech';
import fs from 'node:fs';

function getCredentials() {
  if (process.env.GCLOUD_TTS_CREDENTIALS_BASE64) {
    const json = Buffer.from(process.env.GCLOUD_TTS_CREDENTIALS_BASE64, 'base64').toString('utf8');
    return JSON.parse(json);
  }
  if (process.env.GCLOUD_TTS_KEYFILE) {
    return JSON.parse(fs.readFileSync(process.env.GCLOUD_TTS_KEYFILE, 'utf8'));
  }
  return undefined; // 走应用默认凭据
}

const client = new TextToSpeech.TextToSpeechClient({
  projectId: process.env.GCLOUD_TTS_PROJECT_ID,
  credentials: getCredentials()
});

export async function synthesizeWordToMp3(word: string) {
  const [response] = await client.synthesizeSpeech({
    input: { text: word },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' }
  });
  if (!response.audioContent) throw new Error('TTS empty audioContent');
  return Buffer.from(response.audioContent as Uint8Array);
}
```

---

## 8) `/api/words/[word]` — 主流程

```ts
// src/app/api/words/[word]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseService as db } from '@/lib/supabase';
import { fetchFromDictionaryApi } from '@/lib/dictionary';
import { audioKey, ensureObjectExists, putAudio } from '@/lib/r2';
import { synthesizeWordToMp3 } from '@/lib/tts';

const ParamsSchema = z.object({ word: z.string().min(1) });

export const dynamic = 'force-dynamic'; // 因为我们要写库

export async function GET(_req: Request, { params }: { params: { word: string } }) {
  try {
    const { word } = ParamsSchema.parse(params);
    const key = word.trim().toLowerCase();

    // 1) 查缓存
    const { data: cached, error } = await db
      .from('words')
      .select('*')
      .eq('word', key)
      .maybeSingle();

    if (error) throw error;
    if (cached) {
      return withCacheHeaders(NextResponse.json(cachedToResp(cached)));
    }

    // 2) 查字典 API
    const dict = await fetchFromDictionaryApi(key);
    let phonetic: string | null = dict?.phonetic ?? null;
    let definitions = dict?.meanings ?? [];
    let examples = dict?.exampleCandidates ?? [];

    // 3) 处理音频：优先字典音频，否则 TTS
    let finalAudioUrl: string | null = null;
    const r2Key = audioKey(key);

    if (dict?.audio) {
      // 拉取远端 mp3 并写入 R2（避免热链）
      const audioRes = await fetch(dict.audio);
      if (audioRes.ok) {
        const buf = Buffer.from(await audioRes.arrayBuffer());
        finalAudioUrl = await putAudio(r2Key, buf);
      }
    }

    if (!finalAudioUrl) {
      // 若 R2 已存在，直接拼 URL；否则 TTS 生成
      const exists = await ensureObjectExists(r2Key);
      if (exists) {
        finalAudioUrl = process.env.R2_PUBLIC_BASE!.replace(/\/$/, '') + '/' + r2Key;
      } else {
        const mp3 = await synthesizeWordToMp3(key);
        finalAudioUrl = await putAudio(r2Key, mp3);
      }
    }

    // 4) 入库
    const payload = {
      word: key,
      phonetic,
      definition: definitions,
      examples,
      audio_url: finalAudioUrl,
      tags: [],
      source: dict ? 'dictionaryapi' : 'gcloud-tts'
    };

    const { data: inserted, error: upsertErr } = await db
      .from('words')
      .insert(payload)
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    return withCacheHeaders(NextResponse.json(cachedToResp(inserted)));
  } catch (err: any) {
    console.error('GET /api/words error', err);
    return NextResponse.json({ error: 'internal_error', detail: String(err?.message || err) }, { status: 500 });
  }
}

function cachedToResp(row: any) {
  return {
    word: row.word,
    phonetic: row.phonetic,
    definition: row.definition || [],
    examples: row.examples || [],
    audio_url: row.audio_url
  };
}

function withCacheHeaders(res: NextResponse) {
  // 前端可缓存 1 小时，CDN 可更长；命中 DB 后的稳定响应
  res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  return res;
}
```

---

## 9) 可选：批量导入 `/api/admin/add`

> 仅内部使用：传入单词数组，预热缓存（调用同一流程）。

```ts
// src/app/api/admin/add/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { words } = await req.json().catch(() => ({ words: [] }));
  if (!Array.isArray(words) || words.length === 0) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const base = new URL(req.url);
  const origin = `${base.protocol}//${base.host}`;

  const out: any[] = [];
  for (const w of words) {
    const url = `${origin}/api/words/${encodeURIComponent(String(w))}`;
    const res = await fetch(url);
    out.push({ word: w, status: res.status });
  }
  return NextResponse.json({ ok: true, results: out });
}
```

---

## 10) 前端调用（示例）

```ts
// 使用统一 API
async function getWord(word: string) {
  const res = await fetch(`/api/words/${encodeURIComponent(word)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}
```

---

## 11) Supabase GraphQL（筛选示例）

* 按标签：`tags @> '{ai}'`
* 按首字母：`first_letter = 'h'`
* 字段选择：`word, definition, examples, audio_url`

> 生产上建议对公开读取的 GraphQL 进行视图封装，隐藏内部字段。

```sql
-- 只读视图（示例）
create or replace view public.words_public as
select word, phonetic, definition, examples, audio_url, tags, first_letter
from public.words;
```

---

## 12) Cloudflare R2 配置要点

1. 创建 Bucket：`dictionary-audio`
2. 绑定自定义域名（CF CDN）：`cdn.example.com` → R2 公网访问（或直接使用 R2 Public Bucket 域名）
3. CORS（如需要前端直链）：允许 `GET`，来源你的站点域名
4. 长缓存：对象 `Cache-Control: public, max-age=31536000, immutable`

---

## 13) 安全 & 限流（精简版）

* 管理接口 `/api/admin/*`：仅服务端调用/加密 Token Header 校验
* 读接口 `/api/words/[word]`：公开；若担心滥用，可在 Vercel/CFW 层做 IP 级别速率限制
* Service Role Key 严禁暴露到浏览器（仅服务端使用）

---

## 14) 本地启动 & 部署

```bash
# 1) 拉起 Supabase（可选：本地 or 云端）
# 2) 应用 schema.sql
# 3) 配置 .env（Supabase/R2/GCloud）

pnpm i # 或 npm/yarn
pnpm dev
```

* 部署：Vercel（推荐）或自托管。确保环境变量完整。
* Google TTS：开启 Cloud Text‑to‑Speech API，创建服务账号，授权 `roles/texttospeech.user`。
* R2：创建 Access Key/Secret，配置 Endpoint、CNAME/CDN。

---

## 15) 细节策略（实践向）

* **幂等写入**：当前用 `insert()`；如有并发，改 `upsert({ onConflict: 'word' })`
* **标准化**：所有 `word` 统一 `trim().toLowerCase()`；必要时存 `original_word` 做展示
* **例句来源**：当前直接采集 dictionaryapi.dev 的 `definitions.example`；后续可加 Oxford 等来源
* **多口音**：TTS voice 可加参数；表里新增 `audio_variants jsonb`
* **清理任务**：定时扫描孤儿对象、失效条目
* **监控**：打点字典命中率/TTS调用量/R2 带宽

---

## 16) 简易 README（给协作者）

```md
# Dictionary App

单词→查询缓存→字典API→R2音频→入库；一次生成，多次复用。

## 快速开始
1. 复制 `.env.example` 为 `.env.local` 并填好变量
2. 在 Supabase 应用 `supabase/schema.sql`
3. `pnpm i && pnpm dev`

## 关键接口
- GET /api/words/[word]
- POST /api/admin/add { words: string[] }

## 依赖服务
- Supabase (Postgres)
- Cloudflare R2 (S3)
- Google Cloud Text‑to‑Speech
```


网页操作：

获取所有单词
- nextjs api 通过调用 GraphQL 获取 supabase 的数据库并显示

查询一个单词
- nextjs 服务端组件使用 GraphQL 查找 supabase，如果有则直接返回，如果没有则调用 查询字典 API，"dictionaryapi.dev"，获取音标、例句等，并存入supabase.如果 字典API查无此单词，则不显示音标例句。后续仅通过TTS获取发音。

播放音频
- 查找supabase是否存在这个单词，及其audio_url。如果存在，直接播放链接。如果不存在，调用 Google TTS生成音频，存入R2，链接存入对应单词的audio_url

提交一个单词
- 调用单词查找流程，获取音标、例句等信息。调用tts生成音频，存入R2，获取audio_url 存入supabase。（避免重复）

批量导入单词：管理员
- 循环执行提交一个单词的行为



推翻：


页面简单一点

一个输入框，一个发音按钮。

用户点击发音按钮，查询音标。显示在输入框卡片。

发音按钮直接调用TTS生成。