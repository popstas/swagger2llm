#!/usr/bin/env node
import minimist from 'minimist';
import { promises as fs } from 'fs';
import { downloadSpec, generateSummary } from './index.js';

async function main() {
  const args = minimist(process.argv.slice(2), { boolean: ['multiple'], alias: { m: 'multiple' } });
  const url = args._[0];
  if (!url) {
    console.error('Usage: swagger2llm [--multiple] <url>');
    process.exit(1);
  }
  console.log(`Downloading spec from ${url}`);
  const spec = await downloadSpec(url);
  console.log(`Spec downloaded`);
  if (args.multiple) {
    const dir = 'llms';
    await fs.mkdir(dir, { recursive: true });
    for (const l of [1, 2, 3]) {
      const content = await generateSummary(spec, l);
      await fs.writeFile(`${dir}/llms-level${l}.txt`, content, 'utf8');
      console.log(`llms-level${l}.txt generated`);
    }
  } else {
    const content = await generateSummary(spec, 3);
    await fs.writeFile('llms.txt', content, 'utf8');
    console.log(`llms.txt generated`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
