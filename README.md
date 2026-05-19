# Lumina AI — Academic Study Assistant

An AI-powered study dashboard for students. Built with React, Vite, and Gemini 2.0 Flash.

## Features
- AI step-by-step assignment planning
- Automatic study schedule generation and rescheduling
- Syllabus summarization
- Dashboard panel with assignments and schedule overview
- Hell Week mode (detects exam-heavy weeks automatically)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and paste your GEMINI_API_KEY
   ```
   Get a key at: https://aistudio.google.com/apikey

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Usage
- Click **Add Assignment** or use the clipboard icon in the chat input
- Fill in your assignment details, rubric, deadline, and syllabus
- The AI will generate a step-by-step plan and study schedule
- View your schedule in the **Dashboard** panel (top right)
- If multiple assignments are due within 7 days, Hell Week mode activates automatically
- Press **Shift+H** to manually toggle Hell Week mode for testing
