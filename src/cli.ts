#!/usr/bin/env node
import minimist from 'minimist';
import { promises as fs } from 'fs';
import { downloadSpec, generateSummary } from './index';

async function main() {
  const args = minimist(process.argv.slice(2), { boolean: ['multiple'], alias: { m: 'multiple' } });
  const url = args._[0];
  if (!url) {
    console.error('Usage: swagger2llm [--multiple] <url>');
    process.exit(1);
  }
  const spec = await downloadSpec(url);
  if (args.multiple) {
    const dir = 'llms';
    await fs.mkdir(dir, { recursive: true });
    let level = 1;
    for (const l of [1, 2, 3]) {
      const content = await generateSummary(spec, l);
      await fs.writeFile(`${dir}/llms-level${l}.txt`, content, 'utf8');
      level++;
    }
  } else {
    const content = await generateSummary(spec, 2);
    await fs.writeFile('llms.txt', content, 'utf8');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
