# OpsMemory AI

> **"An AI incident-response engineer that remembers every production failure and learns from every resolution."**

[![Built for Hindsight](https://img.shields.io/badge/Memory-Hindsight-2563eb.svg)](https://hindsight.vectorize.io)
[![Official SDK](https://img.shields.io/badge/@vectorize--io/hindsight--client-0.10.2-blue)](https://www.npmjs.com/package/@vectorize-io/hindsight-client)
[![Theme](https://img.shields.io/badge/Theme-Strict%20Light-10b981.svg)](#light-theme-design)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

OpsMemory AI is a production-grade autonomous incident-response agent for software engineering and SRE/DevOps teams. Unlike generic chatbots or stateless RAG systems, OpsMemory AI solves the fundamental problem of engineering teams repeatedly investigating similar incidents from scratch: **the agent gets measurably better because of memory**.

Built specifically for the **Hindsight AI Hackathon**, OpsMemory AI leverages Hindsight as its persistent, long-term memory engine to retain, recall, and reflect on every production failure, successful remediation, and critically, **past failed remediation attempts**.

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────────────────────────────────────┐
                               │                    OPSMEMORY WEB UI                     │
                               │  (React 18 + Vite + Tailwind CSS — Strict Light Theme)  │
                               └────────────────────────────┬────────────────────────────┘
                                                            │
                                                            ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │                   EXPRESS API BACKEND                   │
                               │         (Node.js v24 + TypeScript + SSE Streams)        │
                               └────────────────────────────┬────────────────────────────┘
                                                            │
                                                            ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │               AI INCIDENT ORCHESTRATOR                  │
                               └──────────────┬───────────────────────────┬──────────────┘
                                              │                           │
                   ┌──────────────────────────▼───┐          ┌────────────▼──────────────────┐
                   │       EVIDENCE ANALYZER      │          │       HINDSIGHT SERVICE       │
                   │ • Telemetry & Anomaly Bounds │          │ • @vectorize-io/hindsight-cli │
                   │ • Log Error Signatures       │          │ • Bank: `opsmemory-production`│
                   │ • Deployment Git Diffs       │          │ • TEMPR Multi-Strategy Search │
                   └──────────────┬───────────────┘          └────────────┬──────────────────┘
                                  │                                       │
                                  └───────────────────┬───────────────────┘
                                                      │
                                                      ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │                 DIAGNOSIS ENGINE                        │
                               │  • Multi-Candidate Root Causes                          │
                               │  • Calibrated Confidence (Likely / Historical Match)    │
                               │  • Cross-checks Against Negative (Failed Fix) Memories  │
                               └──────────────────────┬──────────────────────────────────┘
                                                      │
                                                      ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │                HUMAN APPROVAL GATE                      │
                               │  • Safe Investigation vs Mutating Remediation           │
                               │  • Runbook Authorization & Execution Logs               │
                               └──────────────────────┬──────────────────────────────────┘
                                                      │
                                                      ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │                POST-MORTEM & RETENTION                  │
                               │  • Auto-Generated Editable Post-Mortem                  │
                               │  • Retains Experience, Runbooks & Opinions to Hindsight │
                               └─────────────────────────────────────────────────────────┘
```

---

## 🌟 The Core Closed-Loop Learning Cycle

```
INCIDENT TRIGGERED
       ↓
COLLECT EVIDENCE (Metrics, Application Logs, Git Commits)
       ↓
INVESTIGATE & QUERY HINDSIGHT (`recall` & `reflect`)
       ↓
RECALL SIMILAR INCIDENTS & HISTORICAL OUTCOMES
       ↓
COMPARE PAST OUTCOMES (Identifies Proven Fixes AND Past Failed Fixes)
       ↓
DIAGNOSE WITH CALIBRATED CONFIDENCE
       ↓
RECOMMEND ACTION (Safe vs Dangerous with Human Approval Gate)
       ↓
HUMAN APPROVAL & RUNBOOK EXECUTION
       ↓
RECORD OUTCOME & SRE FEEDBACK
       ↓
GENERATE POST-MORTEM
       ↓
RETAIN INTO HINDSIGHT MEMORY BANK (`opsmemory-production`)
       ↓
FUTURE INCIDENTS BECOME 70% FASTER & AVOID REPEATED MISTAKES
```

---

## 🚀 Live Demo Scenarios for Judges

The built-in **Interactive Simulation Studio** allows 1-click execution of the core before-and-after memory comparison:

### 1. Scenario A: First Occurrence (Day 1 - Zero Prior Memory)
- **Incident**: Payments API 504 Timeouts during flash sale traffic burst.
- **Agent Behavior**: Queries Hindsight bank `opsmemory-production`. Finds no prior matches.
- **Resolution**: Investigates from scratch, identifies DB pool exhaustion, engineer approves pool increase from 100 to 150.
- **Retention**: Experience retained into Hindsight (MTTR: 14.8 minutes).

### 2. Scenario B: Second Occurrence (Day 18 - Hindsight Recalled!)
- **Incident**: Identical latency spike and DB pool saturation surge.
- **Agent Behavior**: Queries Hindsight and **immediately recalls Scenario A (INC-1042) with 94% relevance**.
- **What the Agent Shows**:
  - Exact historical root cause match
  - Prior successful resolution (scaled pool from 100 to 150)
  - Recovery time (4 minutes)
  - Engineer feedback quote: *"Increasing pool to 150 immediately cleared 504 gateway timeouts."*
- **Outcome**: **MTTR reduced from 14.8m to 4.2m (-71% downtime)**.

### 3. Scenario C: Failed Solution Memory (Redis Starvation)
- **Incident**: Latency spikes to 4.2s, DB connections reach 88%.
- **The Pitfall**: An engineer would instinctively scale the DB connection pool again.
- **Hindsight Alert**: Recalls historical incident **INC-1098** where increasing the DB pool **FAILED** because the actual bottleneck was Redis socket timeouts!
- **Agent Warning**:
  > *"CRITICAL MEMORY: Detected Past Failed Remediation (INC-1098). Previous attempt to increase DB pool failed. Actual root cause was Redis cache socket starvation. Prioritizing Redis cluster remediation."*
- **Outcome**: Prevents repeating an ineffective fix, saving 25+ minutes of cascading downtime.

---

## 🎯 Hackathon Judging Criteria Alignment

| Criteria | Weight | How OpsMemory AI Excels |
| :--- | :---: | :--- |
| **Innovation** | **30%** | Moves beyond passive chatbots by implementing an autonomous closed-loop SRE memory plane that actively prevents repeating past mistakes via Negative Memory. |
| **Hindsight Memory** | **25%** | Deep integration with `@vectorize-io/hindsight-client` using official `retain`, `recall`, and `reflect` APIs with semantic, temporal, and tag-aware multi-strategy search. |
| **Technical Implementation** | **20%** | Full-stack TypeScript architecture, resilient zero-downtime memory mirror, real-time Server-Sent Events timeline, and containerized Docker Compose support. |
| **User Experience** | **15%** | Strict light-theme enterprise SRE aesthetic (Datadog/Incident.io style), prominent Hindsight Memory Panel, and human-in-the-loop approval workflows. |
| **Real-world Impact** | **10%** | Directly addresses the multi-billion dollar problem of production downtime and engineering toil by reducing MTTR by up to 71%. |

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js v24, TypeScript, Express, Server-Sent Events (SSE), Zod
- **Memory Engine**: Official `@vectorize-io/hindsight-client` (v0.10.2) + `ghcr.io/vectorize-io/hindsight:latest`
- **Memory Bank**: `opsmemory-production`
- **Design Standard**: **Strict Light Theme Only** (No dark mode)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18 (Tested on v24.16.0)
- npm >= 9

### Option 1: Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/your-username/Microsoft-Hackathon.git
cd Microsoft-Hackathon

# 2. Install all dependencies
npm run install:all

# 3. Start both backend and frontend concurrently
npm run dev
```

- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

### Option 2: Run with Docker Compose (Includes Official Hindsight Server)

```bash
docker compose up --build
```
- **OpsMemory Web UI**: [http://localhost:5173](http://localhost:5173)
- **OpsMemory Backend API**: [http://localhost:3001](http://localhost:3001)
- **Official Hindsight API**: [http://localhost:8888](http://localhost:8888)
- **Hindsight Control Plane UI**: [http://localhost:9999](http://localhost:9999)

---

## 🧪 Automated Verification Suite

Run the full integration test suite:

```bash
cd backend
npm test
```

### Verified Test Cases:
1. `Natural Language AI Parser` extracting telemetry & entities
2. `Autonomous Investigation Pipeline` correlating logs and metrics
3. `Hindsight Memory Bank Recall` via official `@vectorize-io/hindsight-client`
4. `Negative Memory Alerting` detecting past failed fixes
5. `Human Approval Gate` authorizing and executing runbooks
6. `Engineer Feedback & Experience Retention` into Hindsight
7. `Automated Post-Mortem Generation` and Hindsight knowledge ingestion
8. `Hindsight Memory Explorer` semantic search queries
