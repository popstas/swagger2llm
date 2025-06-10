# swagger2llm

Generate small text descriptions from Swagger/OpenAPI files for use with LLM context.

## Usage

```
# single file
npx swagger2llm https://example.com/swagger.json
# multiple detail levels
npx swagger2llm --multiple https://example.com/openapi.yaml
```

When `--multiple` is used, files `llms-level1.txt`, `llms-level2.txt` and `llms-level3.txt` are placed in the `llms` directory. Without it a single `llms.txt` is created in the current directory.

## Development

```
npm install
npm run build
npm test
```

## License

MIT © 2025 Stanislav Popov
