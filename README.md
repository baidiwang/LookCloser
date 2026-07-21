# Look Closer

An immersive museum viewer that notices where a visitor's attention settles and responds with a quiet AI curator note.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then enter the artwork viewer. Move slowly over the painting and keep the cursor within a small area for about 1.75 seconds. The annotation is immediately clickable while the dynamic curator copy finishes quietly in the background.

The experience remains fully usable without an API key by falling back to deterministic copy built from the same verified hotspot seeds.

## Enable the AI curator

Add a server-side key to `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_CURATOR_MODEL=gpt-5.6-sol
```

Restart `npm run dev` after changing environment variables. The browser never receives the API key; curator generation runs only in `src/app/api/curator/route.ts` through the OpenAI Responses API and returns strict JSON.

The curator prompt architecture is intentionally separated from the route:

- `src/prompts/curator-system-prompt.ts` defines the curator's identity and voice.
- `src/prompts/curator-user-prompt.ts` builds the visitor journey context for each attention event.
- `src/prompts/curator-output-schema.ts` owns the strict Structured Output contract.

## Verify

```bash
npm run lint
npm run build
```

Hotspot metadata lives in `src/data/last-supper.ts`. It contains twelve invisible regions with factual and deeper-story seeds; final curator wording is generated at request time when an API key is available.
