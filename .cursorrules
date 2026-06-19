# CLAUDE.md – regler för AI-assistenter

Liten, statisk lärwebbplats på svenska för Edison-roboten V3.

## Teknik
- Endast statisk HTML + CSS + vanilla JS. Inga ramverk, ingen build, inga bundlers.
- Måste fungera både via file:// och GitHub Pages.
- Inga externa beroenden eller nätverksanrop.

## Innehåll
- ALL UI-text på svenska. Kodkommentarer får vara på engelska.
- Lägg all text i content/*.json – aldrig hårdkodad i app.js. Ska gå att
  redigera från GitHub-appen på mobilen utan att röra logiken.
- Datamodell per steg:
  { "role": "child" | "adult",
    "type": "text" | "question_single_choice" | "ordering",
    "text": "...", "options": [...], "correctAnswer": ... }

## Pedagogik
- Hög läsnivå men görs tillsammans. Max 2–3 meningar per steg.
- Tilltala barnet direkt. "adult"-steg = korta tips till den vuxne, i avvikande stil.
- Mytologi-metaforer välkomna (program = profetia, bugg = monster, uppdrag = hjälteprov).

## UX
- Mobil-först: en kolumn, inga sidopaneler. Touch-knappar minst 44 px.
  Max innehållsbredd ~600 px.
- En "Nästa"-knapp per steg, minimera scroll.
- INGEN drag-and-drop i v1. Sekvenser görs med "klicka i ordning" eller upp/ner-pilar.

## Edison V3-fakta
- EdBlocks-appen: edblocksapp.com/v3/. Programmeras via USB i webbläsaren (kräver Chrome).
- Antag MacBook + Chrome + USB-kabel för programmeringssteg.

## Referensmaterial
- docs/reference/ kan innehålla EdBlocks-lärarguiden som IDÉBANK.
  Kopiera ALDRIG text därifrån – skriv om allt med egna svenska ord.

## Arbetssätt
- Små ändringar, en branch + en PR i taget. Visa hela filen när du ändrar den.
