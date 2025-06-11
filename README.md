# swagger2llm

Generate text descriptions from Swagger/OpenAPI files for use with LLM context.

## Usage

```
# single file (maximum detail)
npx swagger2llm https://example.com/swagger.json
# multiple detail levels
npx swagger2llm --multiple https://example.com/openapi.yaml
```

Flags `--no-examples` and `--no-llm` can be used to remove example blocks from
the specification and to disable shortening via the OpenAI API respectively.

When `--multiple` is used, files `llms-level1.txt`, `llms-level2.txt` and `llms-level3.txt` are placed in the `llms` directory. Without it a single `llms.txt` with the most details is created in the current directory.

Set `OPENAI_API_KEY` to let the tool shorten very long texts via the OpenAI API.

## Development

```
npm install
npm run build
npm test
```

## License

MIT © 2025 Stanislav Popov
