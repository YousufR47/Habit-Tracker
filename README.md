# Habit Tracker Owner's Guide

This folder contains a self-contained habit tracker app. It is designed to run in a browser, save your data on your own device, and keep working offline after it has been opened once.

You do not need to be a coder to use it. This file is here so future-you, or someone helping you, can understand what the app is, how to open it, how to back it up, and what to check if something goes wrong.

## Quick Start

The app lives in this folder:

`C:\Users\yrehm\Downloads\habit-tracker-codex-goals-record`

The main file is:

`index.html`

To open the app normally, double-click `index.html`.

For the best app-like experience, open it through a local web server instead of directly from the file. This matters because the offline/install feature, called the service worker, needs a proper browser URL such as `http://127.0.0.1:4173/index.html`.

One working local URL used during testing was:

`http://127.0.0.1:4173/index.html`

If Codex or another helper starts a small local server for this folder, use that URL.

## What Each File Does

`index.html`

This is the whole app: screen layout, styling, buttons, habits, goals, stats, backup tools, and most of the JavaScript logic. If someone needs to recreate or fix the app, this is the most important file.

`manifest.json`

This tells the browser that the tracker is an installable web app. It controls the app name, icon, theme colour, start page, and phone-style install behaviour.

`sw.js`

This is the service worker. It lets the app cache its files so it can keep opening offline after the browser has loaded it once from a proper local or web URL.

`icon.svg`

This is the app icon.

## How Your Data Is Saved

Your habit and goal data is not saved inside `index.html`. It is saved inside your browser storage on the same device, using something called `localStorage`.

Important storage names used by the app:

`habits_v2`

Stores your habits, completions, streak information, notes, categories, and habit settings.

`goals`

Stores your goals.

`cat_colors`

Stores category colours.

`habits_last_export`

Stores the date of your most recent backup/export.

Safety-copy keys may also appear, such as:

`full_safety_...`

`habits_pre_import_...`

`goals_pre_import_...`

These are emergency copies the app may create before imports or restores.

Important: because data is stored in the browser, changing browser profiles, clearing site data, using private/incognito mode, or moving to a different device can make the app look empty unless you import a backup.

## Backups

Backups are the most important habit for the habit tracker itself.

Use the app's backup/settings area to export your data. Keep backup files somewhere safe, such as Downloads, OneDrive, Google Drive, iCloud, an external drive, or a folder you regularly back up.

Recommended backup routine:

1. Export a full backup after setting up the app.
2. Export again after adding lots of habits or goals.
3. Export at least weekly if you rely on the app.
4. Before importing or making big changes, export first.

If the app ever looks empty, do not immediately add new habits. First check whether you opened it in a different browser/profile, then import your latest backup.

## What Was Tested

On 2026-05-06, Codex ran these checks:

`sw.js` JavaScript syntax check: passed.

`manifest.json` JSON parse check: passed.

`index.html` app script syntax check: passed.

Browser load check at `http://127.0.0.1:4173/index.html`: passed.

Service worker registration: passed.

Basic app flow: adding a habit and toggling it worked.

Console/runtime errors during that check: none found.

This does not prove every possible feature is perfect forever, but it proves the app opens, runs, registers offline support, and handles the main habit flow.

## What A JS Execution Check Means

A JavaScript execution check means the app is actually run, instead of only being read by a human.

There are levels:

1. Syntax check: catches broken JavaScript punctuation, missing brackets, invalid JSON, and similar issues.
2. Browser load check: opens the app in a browser and watches for runtime errors.
3. Interaction check: clicks through important flows like adding a habit, opening settings, exporting, importing, or toggling completion.

For this app, a useful future check is:

1. Open it through a local server.
2. Confirm the page title is `Habits`.
3. Confirm the Today, Stats, Goals, and Settings tabs show.
4. Add a temporary habit.
5. Toggle it done.
6. Check the browser console for red errors.
7. Delete the temporary habit or use a throwaway browser profile for testing.

## Opening It With A Local Server

If double-clicking `index.html` works for normal use, that is okay. But for install/offline/service-worker behaviour, use a local server.

One simple command that can serve the folder is:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory "C:\Users\yrehm\Downloads\habit-tracker-codex-goals-record"
```

Then open:

`http://127.0.0.1:4173/index.html`

If `python` is not available, Codex can use its bundled Python runtime to start the same kind of server.

## If The App Looks Empty

Try these in order:

1. Make sure you are using the same browser and browser profile as before.
2. Do not use private/incognito mode for your real tracker.
3. Check whether the URL changed from `http://127.0.0.1:4173/index.html` to something else.
4. Open Settings or Backup inside the app and look for safety copies.
5. Import your latest full backup.
6. Avoid adding new habits until you have checked for backups, because new empty data can make recovery more confusing.

## If Offline Mode Stops Working

The offline behaviour is controlled by `sw.js`.

Try:

1. Open the app online or through the local server at least once.
2. Refresh the page.
3. Close and reopen the browser.
4. If a helper is available, ask them to check that `sw.js` still loads and that the service worker is registered.

The current service worker cache name is:

`habits-pwa-v5`

If the app files change but the browser keeps showing an old version, the helper may need to update the cache name in `sw.js` or clear the site's service worker/cache in the browser dev tools.

## If Install To Phone/Desktop Does Not Work

The install feature depends on:

`manifest.json`

`icon.svg`

`sw.js`

A browser URL such as `http://127.0.0.1:4173/index.html` or a real hosted `https://` website.

It may not install correctly from a direct `file://` open.

## If Someone Needs To Recreate The App

Give them this folder and tell them:

The app is a local-first single-page PWA habit tracker.

The entire interface and main logic are in `index.html`.

It stores habits in browser `localStorage` under `habits_v2`.

It stores goals in browser `localStorage` under `goals`.

It has an offline service worker in `sw.js`.

It has an install manifest in `manifest.json`.

It should be tested through a local server, not only by double-clicking the file.

The app should preserve these main features:

Today dashboard.

Habit creation and editing.

Habit completion tracking.

Numeric habits with floor/goal values.

Tiers and categories.

Stats/calendar views.

Goals view.

Backup, import, export, and safety-copy recovery.

Offline/PWA support.

## Suggested Prompt For Future Codex Help

AI helpers have different abilities. Some can directly read files on your computer. Many cannot. If the AI cannot access files, paste this README, describe what you see, and upload or paste the relevant file contents when asked.

Use this version if the AI can access your files:

```text
I have a local habit tracker PWA in:
C:\Users\yrehm\Downloads\habit-tracker-codex-goals-record

Please inspect index.html, manifest.json, sw.js, and icon.svg. Do not delete or overwrite my data. My habit data is stored in browser localStorage, mainly under habits_v2 and goals. Start a local server for the folder, open http://127.0.0.1:4173/index.html, run a JavaScript/browser execution check, check for console errors, confirm the service worker registers, and test the basic add/toggle habit flow. If you make changes, explain them in plain English and make sure backups still work.
```

Use this version if the AI cannot access your files:

```text
I have a local Habit Tracker PWA, but you probably cannot access my computer files directly. Please help me safely troubleshoot or recreate it from the information I paste.

Important facts:
- The app folder is C:\Users\yrehm\Downloads\habit-tracker-codex-goals-record
- The files are index.html, manifest.json, sw.js, and icon.svg
- The main app logic is in index.html
- Habit data is stored in browser localStorage under habits_v2
- Goal data is stored in browser localStorage under goals
- Category colours are stored under cat_colors
- Offline support comes from sw.js
- Install/app mode comes from manifest.json
- Backups are essential because the real habit data is in the browser, not inside index.html

Please ask me for only the specific thing you need next. For example, ask me to paste an error message, a screenshot, the README, the manifest, the service worker, or a small section of index.html. Explain each step in plain English and do not assume you can inspect my machine.
```

## What To Paste Into An AI Chat

If an AI cannot access your files, paste information in this order:

1. What you are trying to do.
2. What went wrong, in your own words.
3. A screenshot or exact error message, if there is one.
4. This README.
5. `manifest.json`.
6. `sw.js`.
7. The relevant part of `index.html`, only if the AI asks for it.

Avoid pasting huge files immediately unless the AI says it can handle them. Ask it: "Which exact section do you need?"

## Flexible AI Support Checklist

Ask the AI to help you check:

Does the app open?

Does it show Today, Stats, Goals, and Settings?

Does adding a test habit work?

Does toggling a test habit work?

Does export/backup still work?

Does import ask for confirmation or create a safety copy?

Does the browser console show any red errors?

Is the app using the same browser profile where your real data lives?

## Before Editing The App

Before anyone changes code, make a copy of the whole folder.

Also export a full backup from inside the app.

Good backup names:

`habit-tracker-folder-backup-YYYY-MM-DD`

`habit-tracker-data-backup-YYYY-MM-DD.json`

This gives you two kinds of protection:

The folder backup protects the app files.

The data backup protects your habits and goals.

## Plain-English Summary

This app is like a tiny website that lives on your computer. The files make the app appear, but your actual habit history lives in the browser. Keep the files safe, keep backups of your data, and test it in a browser whenever changes are made. If an AI helper cannot see your files, use this README as the map and paste only the specific files or errors it asks for.
