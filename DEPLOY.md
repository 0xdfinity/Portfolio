# Deploy to GitHub Pages

## Push the project to your GitHub account

1. Create a new empty repository at https://github.com/new named `portfolio` under `0xdfinity`. Do not add a README, license, or gitignore, since this project already has its files.
2. In a terminal, from this `portfolio` folder, run:

```sh
git init
git add .
git commit -m "Build Atunde portfolio"
git branch -M main
git remote add origin https://github.com/0xdfinity/portfolio.git
git push -u origin main
```

## Enable GitHub Pages

1. In the `Portfolio` repo, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**. The included `.github/workflows/pages.yml` builds the Astro site and deploys it; no branch/folder selection is needed.
3. Push to `main` (or run the workflow manually) to trigger the first deploy. The live URL is `https://0xdfinity.github.io/Portfolio/`, matching `site` and `base` in `astro.config.mjs`.

The build fetches public GitHub data anonymously by default. For authenticated, higher-rate-limit reads, the workflow already passes the automatic `GITHUB_TOKEN` to the build step — no secret to create. Never commit a token or put one in browser code.

## Daily auto-refresh

The page fetches your public repo list and each featured README at build time and bakes them into static HTML; visitors' browsers never call GitHub. To keep itself current, `.github/workflows/pages.yml` rebuilds and redeploys on a schedule (`0 3 * * *`, daily at 03:00 UTC), on every push to `main`, and on manual dispatch. Each run re-fetches GitHub, so new repositories and README edits appear within a day with no action from you. The hero carries a "Self-updating · synced {date}" stamp set at build time.

GitHub pauses scheduled workflows after 60 days of no repository activity; any push or manual run reactivates them. To refresh on demand, open the repo's **Actions** tab, select **Deploy portfolio to GitHub Pages**, and click **Run workflow**.

## Editing your portfolio details

Edit `src/config.ts` to change your headline, social links, featured repository names, or the edQorta case-study copy. LinkedIn is present in config but hidden on the page until `verified` is set to `true`; the email link stays hidden until you replace its empty placeholder with a real address and set `placeholder` to `false`. `public/cv.pdf` is the downloaded CV file. Commit and push edits to publish them.

The project uses Astro 7 and requires Node.js 22.23.4 or newer. The Pages workflow builds with Node 22 (`actions/setup-node`); locally, use Node 22 or newer.
