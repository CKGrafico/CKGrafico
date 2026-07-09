## Active Projects:

- ☄️ Orbion - Control plane for Loop Engineering (soon)
- 🧰 [Opencode Onboard - Prepare a project for AI develompent](https://opencode.ckgrafico.com)
- 🧵 [Loop Task - Shell commands at human-readable intervals](https://loop.ckgrafico.com)

## Other Tools:
- 🪼 [Inversify Props](https://inversify-props.ckgrafico.com)
- 🪝 [Inversify Hooks](https://inversify-hooks.ckgrafico.com)
- 🏪 [Opencode Market CLI](https://github.com/CKGrafico/opencode-market)

## More about me
- <img src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/javascript.svg" width="14"/> Frontend Lover
- <img src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/linkedin-icon.svg" width="14"/> I've also a [linkedin profile](https://www.linkedin.com/in/quiquefdezguerra)

---

## Editing the website (ckgrafico.com)

Content lives in plain JSON — edit a file, push to `main`, and GitHub Actions rebuilds and deploys automatically.

| Section   | Edit this file          |
| --------- | ----------------------- |
| Projects  | `data/projects.json`    |
| Strategy  | `data/strategy.json`    |
| Speaking  | `data/speaking.json`    |
| Startups  | `data/startups.json`    |

- Layout / static bits (hero, stats, headers, contact): `src/template.html`
- Styles: `src/styles.css` — Behavior: `src/script.js`
- Build locally: `node build.mjs` (outputs to `dist/`). No install needed.
- Deploy: push to `main` → `.github/workflows/deploy.yml` builds `dist/` and publishes to Pages.

**One-time setup:** GitHub → Settings → Pages → **Source = "GitHub Actions"**.
