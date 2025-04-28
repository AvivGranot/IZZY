# CLAUDE.md ─ Project Charter & Coding Playbook  
Last-updated: 2025-04-26

────────────────────────────────────────────────────────
🏗  PROJECT OVERVIEW
────────────────────────────────────────────────────────
**Product:** IZZY – AI-Avatar Tutor for Real-World Conversation  
**Mission:** Give men worldwide the confidence and skill to approach women through realistic, culture- and language-aware practice sessions with a lifelike AI avatar.  
**Long-term vision:** A full adaptive coaching platform (voice, AR glasses, real-time street prompts).

### MVP  (Milestone M-0.5 – ship in 1 week)
1. **Responsive React web app** embedding the IZZY talking-head iframe.  
2. **Chat panel** → Node 18 + Fastify → Ollama (llama-3) streaming responses with persona prompt.  
3. **Three free prompts**, Stripe checkout after the limit.  
4. **Firebase Auth (magic-link) + Realtime DB** for history and prompt counters.  
5. **Referral bonuses** (+5 / +10 / +20 prompts for 1 / 2 / 3 sign-ups).  
6. **Basic analytics & error logging.**

Everything else (advanced coaching levels, custom avatars, AR mode, etc.) is tagged `WONT-DO-NOW`.

---

### Default persona for the MVP  
*“East-Coast college girl – most attractive on campus, sporty vibe.”*  
If the user crosses the line too soon, she will “ghost” or shut down the conversation exactly like a real person would. 

Future releases will let users specify **country, region, culture, personality, attractiveness level, hobbies, etc.** (e.g. *“woman from Kerala, India – introverted literature major”*). That will require **fine-tuning / RAG on top of Ollama**. For now we hard-code the East-Coast persona.

---

────────────────────────────────────────────────────────
⚙️  TECH STACK & CONVENTIONS
────────────────────────────────────────────────────────
| Layer            | Choice                                   | Why                                                     |
|------------------|------------------------------------------|---------------------------------------------------------|
| UI               | React 18 + Tailwind CSS                  | Large training corpus – LLMs write idiomatic code fast. |
| Backend API      | Node 18 + Fastify                        | Lightweight, easy SSE streaming.                        |
| LLM Runtime      | **Ollama (local) – llama-3**             | Runs offline, no cloud fees.                            |
| Fine-tuning plan | RAG / adapters on persona transcripts    | To make Ollama behave like real women (post-MVP).       |
| Data/Auth        | Firebase Auth + Realtime DB              | Zero-ops, real-time sync.                               |
| Payments         | Stripe Checkout                          | PCI-minimal, well-documented.                           |
| Tests            | Playwright (e2e) + Vitest (unit)         | High-level click-through tests first.                   |
| Version control  | git  (main + feature branches)           | Commit after each completed plan section; reset if AI drifts. |

#### Coding style rules
