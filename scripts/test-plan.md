# Chatbot Verification Test Plan

This document outlines 10 manual test scenarios to verify the upgrades to the Portfolio Chatbot (Memory, Context Awareness, and Follow-ups).

## Prerequisites
- Server running (`npm run dev`)
- Chatbot open in browser (bottom-right)

## Test Scenarios

### 1. Portfolio Context Check
**User:** "What tech stack handles the 3D elements in this portfolio?"
**Expected:** Bot identifies "Three.js" and "React Three Fiber" without needing correct project name.
**Verify:** Debug logs show `activeRepo: 3D-Portfolio`.

### 2. Pronoun Follow-up (Portfolio)
**User:** "How does *it* optimize performance?"
**Expected:** Bot understands "it" refers to the Portfolio and discusses `drei` or optimizations.

### 3. Explicit Context Switch
**User:** "Tell me about ResearcherX."
**Expected:** Bot switches context to `ResearcherX` and gives a summary.
**Verify:** Debug logs show `activeRepo: ResearcherX`.

### 4. Nested Follow-up (ResearcherX)
**User:** "What AI models does *it* use?"
**Expected:** Bot answers "GPT-4" or similar based on ResearcherX context.

### 5. Multi-turn Tech Query
**User:** "Show me the requirements.txt file."
**Expected:** Bot fetches file content from `ResearcherX` repo.

### 6. Ambiguous Query Resolution
**User:** "How do I run the project locally?"
**Expected:** Bot should answer for `ResearcherX` (current context) OR ask "Which project?" if context expired (but it shouldn't expire yet).

### 7. Explicit Context Switch (Doctor.ai)
**User:** "Switch to Doctor.ai."
**Expected:** Bot confirms switch and summarizes Doctor.ai.

### 8. Specific File Request
**User:** "Read src/lib/memoryStore.ts please."
**Expected:** Bot (if in Portfolio context) reads the file. If in Doctor.ai, it might fail or switch back if smart enough (or user might need to specify repo).
*Correction:* User should say "Read src/lib/memoryStore.ts from Portfolio" if context is wrong.

### 9. Token Truncation Test
**User:** (Paste a very long message > 5000 chars)
**Expected:** Bot accepts it, truncates history internally, and responds normally.

### 10. Memory Persistence (Refresh)
**Action:** Refresh the browser page.
**User:** "What project were we just talking about?"
**Expected:** Bot remembers "Doctor.ai" (from localStorage `chatHistory`).

## Automated Verification
Run the following script to verify backend logic without UI:
```bash
npx tsx scripts/verify-chat-scenarios.ts
```
