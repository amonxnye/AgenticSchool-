# Agentic School

AI School of AI Tools and Agents.

> **In a gold rush, the best thing you can do is teach people how to mine for gold better, and give them the skills to do it. This is AI today.**

Agentic School is an international, AI-first, human-supervised school for AI, AI agents and AI-native work. AI teaching agents deliver the everyday instruction. Human experts design the learning, supervise quality and provide premium instruction.

The public promise:

> **$100. Two weeks. One new AI capability.**

## Documentation

| Document | Purpose |
| --- | --- |
| [Positioning: The Gold Rush Principle](docs/Agentic_School_Positioning_The_Gold_Rush.md) | The core thesis, where it holds and breaks, and how it maps to the product |
| [Product and Operating Model](docs/Agentic_School_Product_and_Operating_Model.md) | The idea, business structure, audiences, product ladder and long-term vision |
| [Session, Pricing and Teaching Framework](docs/Agentic_School_Session_Pricing_and_Teaching_Framework.md) | What a Session is, the eight-hour structure, pricing and lecturer economics |
| [Master Software Requirements Specification v2](docs/Agentic_School_Master_SRS_v2.md) | Full platform requirements, from positioning to MVP scope and architecture |

Operated internationally by FMG.

## Running the platform

The app is a Next.js project (TypeScript, Tailwind) with a thin model gateway so the AI provider stays swappable.

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY, or set MODEL_PROVIDER=mock
npm run dev                  # http://localhost:3000
npm test                     # unit tests
npm run typecheck && npm run lint && npm run build
```

### How a class works

A lesson is a script of beats written by a human expert in `src/content/sessions/`. The teaching agents run the script; they do not invent the curriculum.

| Beat | Who leads | What happens |
| --- | --- | --- |
| Explain | Maya, AI Instructor | Teaches the expert's points, with examples from the learner's profession |
| Watch | The human expert | A short recorded clip |
| Check | Maya | Asks the expert's questions one at a time and gives feedback |
| Do | Atlas, Lab Coach | Reviews the learner's lab submission against the expert's criteria |
| Apply | Project Coach | Responds to the learner's reflection and links it to the Session project |

The runtime lives in `src/components/LessonRuntime.tsx`; the agent prompts are built in `src/lib/prompts.ts`; the gateway is `src/lib/gateway.ts`.
