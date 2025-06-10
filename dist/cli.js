#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const fs_1 = require("fs");
const index_1 = require("./index");
async function main() {
    const args = (0, minimist_1.default)(process.argv.slice(2), { boolean: ['multiple'], alias: { m: 'multiple' } });
    const url = args._[0];
    if (!url) {
        console.error('Usage: swagger2llm [--multiple] <url>');
        process.exit(1);
    }
    const spec = await (0, index_1.downloadSpec)(url);
    if (args.multiple) {
        const dir = 'llms';
        await fs_1.promises.mkdir(dir, { recursive: true });
        for (const l of [1, 2, 3]) {
            const content = await (0, index_1.generateSummary)(spec, l);
            await fs_1.promises.writeFile(`${dir}/llms-level${l}.txt`, content, 'utf8');
        }
    }
    else {
        const content = await (0, index_1.generateSummary)(spec, 3);
        await fs_1.promises.writeFile('llms.txt', content, 'utf8');
    }
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
