"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadSpec = downloadSpec;
exports.generateSummary = generateSummary;
const yaml_1 = require("yaml");
const openai_1 = __importDefault(require("openai"));
async function downloadSpec(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    try {
        return JSON.parse(text);
    }
    catch {
        return (0, yaml_1.parse)(text);
    }
}
function truncate(text, max = 120) {
    return text.length > max ? text.slice(0, max - 3) + '...' : text;
}
async function maybeShorten(text) {
    if (text.length <= 300 || !process.env.OPENAI_API_KEY) {
        return truncate(text);
    }
    const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'Shorten the following swagger description' },
            { role: 'user', content: text }
        ],
        max_tokens: 100
    });
    return truncate(completion.choices[0].message.content || text);
}
async function generateSummary(spec, level = 3) {
    if (level >= 3) {
        return JSON.stringify(spec, null, 2);
    }
    const lines = [];
    const paths = spec.paths || {};
    for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods)) {
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
                    if (p.in)
                        pLine += ` (${p.in})`;
                    if (p.required)
                        pLine += ' required';
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
