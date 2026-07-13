# Callout

Minimal mobile site that listens during pickup volleyball or spikeball and shows the last thing said — so you can check the score without arguing about it.

## Run

```bash
npm install
npm run dev
```

Open the local URL on your phone (same Wi‑Fi) or in a desktop browser. Microphone access needs HTTPS or `localhost`.

## GitHub Pages deploy

Pushes to `main` build and deploy via GitHub Actions (same pattern as [Who's With Who](https://github.com/ryazlee/whos-with-who)).

Live site: https://ryazlee.github.io/callout/

In the repo: **Settings → Pages → Source → GitHub Actions**.

## Notes

- No login, backend, or database — state is stored in `localStorage`
- **New game** clears the saved callout
- Works best in Chrome or Safari with the page left open while listening
