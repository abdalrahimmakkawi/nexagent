# NexAgent — Windsurf Setup Guide
# ══════════════════════════════════════════════════════════════

## 1. OPEN IN WINDSURF
Move this folder to your Documents/AI agent directory, then:
- Open Windsurf
- File → Open Folder → select the `nexagent` folder

---

## 2. INSTALL DEPENDENCIES
Open the Windsurf terminal (Ctrl+` or View → Terminal):

```bash
npm install
```

---

## 3. SET UP ENVIRONMENT VARIABLES
Copy the example env file:

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your two API keys:

### Get your Anthropic (Claude) key:
→ https://console.anthropic.com
→ API Keys → Create Key
→ Paste into: ANTHROPIC_API_KEY=

### Get your Google AI (Gemini) key:
→ https://aistudio.google.com/app/apikey
→ Create API Key
→ Paste into: GOOGLE_AI_API_KEY=

---

## 4. RUN LOCALLY
```bash
npm run dev
```

Open your browser:
- Landing page → http://localhost:3000
- Live demo    → http://localhost:3000/demo

---

## 5. PROJECT STRUCTURE

```
nexagent/
├── src/
│   ├── lib/
│   │   ├── ai-router.ts        ← Claude + Gemini routing brain
│   │   └── store-configs.ts    ← All client/store configurations
│   ├── hooks/
│   │   └── useChat.ts          ← Chat state management
│   ├── components/
│   │   └── ChatWidget.tsx      ← The embeddable chat UI
│   └── pages/
│       ├── index.tsx           ← Landing page
│       ├── demo.tsx            ← Live demo page
│       └── api/
│           └── chat.ts         ← API route (Claude + Gemini)
├── .env.example                ← Copy to .env.local
├── vercel.json                 ← Vercel deployment config
└── package.json
```

---

## 6. ADD A NEW CLIENT (takes 5 minutes)
Open `src/lib/store-configs.ts` and add a new entry:

```typescript
myClient: {
  id: 'myClient',
  name: 'Client Business Name',
  emoji: '🏪',
  agentName: 'Sam',
  industry: 'E-commerce',
  leadField: 'email',
  leadLabel: '📧 Get updates & deals',
  quickPrompts: ['How do I ...?', 'What is ...?'],
  systemPrompt: `You are Sam, support agent for [Business Name].
    [Add all business info, policies, products, tone guidelines here]`
}
```

That's it. The agent is immediately available at /demo.

---

## 7. DEPLOY TO VERCEL

### Option A — Vercel CLI (fastest):
```bash
npm install -g vercel
vercel
```
Follow the prompts. When asked for environment variables, paste your keys.

### Option B — GitHub + Vercel (recommended for production):
1. Create a GitHub repo and push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial NexAgent deployment"
   git remote add origin https://github.com/YOUR_USERNAME/nexagent.git
   git push -u origin main
   ```
2. Go to https://vercel.com → New Project → Import your repo
3. Add environment variables in Vercel dashboard:
   - ANTHROPIC_API_KEY
   - GOOGLE_AI_API_KEY
   - AI_ROUTING_MODE = auto
4. Click Deploy → Done. Live in ~2 minutes.

---

## 8. AI ROUTING MODES
Set AI_ROUTING_MODE in your .env.local:

| Mode   | Behavior                                           |
|--------|----------------------------------------------------|
| auto   | Gemini for simple FAQ, Claude for complex/upset    |
| claude | Always use Claude (higher quality, slightly slower)|
| gemini | Always use Gemini (faster, cheaper)                |

Recommendation: use `auto` in production to minimize API costs.

---

## 9. COSTS (monthly estimate per client)
- Claude API: ~$15–40/month per active deployment
- Gemini API: ~$5–15/month per active deployment
- Auto routing: ~$20–40/month total (best balance)
- Vercel hosting: Free on hobby plan, $20/month pro

You charge clients $800–$3,000/month. Your cost is ~$50–60/month.
Margin: ~95%.

---

## SUPPORT
Built by NexAgent. Questions → hello@nexagent.io
