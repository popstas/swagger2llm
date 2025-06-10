import { parse as parseYaml } from 'yaml';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// Get the cache directory in a way that works with both ESM and CommonJS
const getCacheDir = () => {
  try {
    // ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '..', '.cache');
  } catch (e) {
    // CommonJS fallback
    return path.join(process.cwd(), '.cache');
  }
};

const CACHE_DIR = getCacheDir();
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

function safeUrlFilename(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase() + '.json';
}

async function getCachedSpec(url: string): Promise<any | null> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const cacheFile = path.join(CACHE_DIR, safeUrlFilename(url));

    const stats = await fs.stat(cacheFile).catch(() => null);
    if (!stats) return null;

    const isExpired = (Date.now() - stats.mtimeMs) > CACHE_TTL_MS;
    if (isExpired) return null;

    const content = await fs.readFile(cacheFile, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function cacheSpec(url: string, data: any): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const cacheFile = path.join(CACHE_DIR, safeUrlFilename(url));
    await fs.writeFile(cacheFile, JSON.stringify(data), 'utf8');
  } catch (error) {
    console.error('Failed to cache spec:', error);
  }
}

export async function downloadSpec(url: string): Promise<any> {
  // Try to get from cache first
  const cached = await getCachedSpec(url);
  if (cached) {
    return cached;
  }

  // Fetch from network if not in cache or cache is expired
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = parseYaml(text);
  }

  // Cache the result
  await cacheSpec(url, data);

  return data;
}

function truncate(text: string, max = 120): string {
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
}

async function maybeShorten(text: string): Promise<string> {
  if (text.length <= 300 || !process.env.OPENAI_API_KEY) {
    return truncate(text);
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'Shorten the following swagger description' },
      { role: 'user', content: text }
    ],
    max_tokens: 100
  });
  return truncate(completion.choices[0].message.content || text);
}

export async function generateSummary(spec: any, level = 3): Promise<string> {
  if (level >= 3) {
    return JSON.stringify(spec, null, 2);
  }
  const lines: string[] = [];
  const paths = spec.paths || {};
  for (const [path, methods] of Object.entries<any>(paths)) {
    for (const [method, details] of Object.entries<any>(methods)) {
      let line = `${method.toUpperCase()} ${path}`;
      if (details.summary) {
        line += ` - ${await maybeShorten(details.summary)}`;
      }
      if (details.description) {
        const desc = await maybeShorten(details.description);
        line += `: ${desc}`;
      }
      lines.push(line);
      if (level >= 2 && Array.isArray(details.parameters)) {
        for (const p of details.parameters) {
          let pLine = `  param ${p.name}`;
          if (p.in) pLine += ` (${p.in})`;
          if (p.required) pLine += ' required';
          if (p.description) {
            pLine += ` - ${await maybeShorten(p.description)}`;
          }
          lines.push(pLine);
        }
      }
    }
  }
  return lines.join('\n');
}
