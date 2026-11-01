# Deploy to GitHub and Vercel

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

## Import it to Vercel

1. Sign in at https://vercel.com/dashboard.
2. Select **Add New...** then **Project** (or **Create New** then **Project**), and connect GitHub if asked.
3. Find `0xdfinity/portfolio` in **Import Git Repository**, then click **Import**.
4. Keep the detected **Astro** framework, set **Root Directory** to `./` if prompted, and leave the build command as `npm run build` and output directory as Astro's default. Static Astro deploys to Vercel without an adapter.
5. If you want authenticated GitHub API requests, add `GITHUB_TOKEN` in **Project → Settings → Environment Variables**, select **Production** (and Preview if wanted), then **Save**. Use a fine-grained, read-only token with access only to the repositories needed. Trigger a redeploy after changing environment variables. Public repo fetches work without this token; never commit a token or put one in browser code.
6. Click **Deploy**. This starts the first Vercel deployment. Later pushes to the connected production branch trigger deployments automatically.

## Daily repo refresh

The static page fetches the public repo list and each featured public README at build time; it does not make GitHub requests in visitors' browsers. `.github/workflows/daily-rebuild.yml` runs at 03:00 UTC daily and manually on demand. To connect the scheduled workflow to Vercel, create a deploy hook after importing: open the project in Vercel, choose **Settings → Git → Deploy Hooks**, enter a name such as `daily-rebuild`, choose the production branch (usually `main`), then click **Create Hook**. Copy its URL. In GitHub, open the `portfolio` repo and choose **Settings → Secrets and variables → Actions → New repository secret**. Name it `VERCEL_DEPLOY_HOOK`, paste the hook URL as its value, and click **Add secret**. The workflow POSTs to that hook daily, which starts a fresh build and refreshes the repo content. Treat the hook URL like a password. Without this secret the scheduled workflow deliberately fails with a clear error, but ordinary Git-push deployments still work.

## Editing your portfolio details

Edit `src/config.ts` to change your headline, social links, featured repository names, or the edQorta case-study copy. LinkedIn is present in config but hidden on the page until `verified` is set to `true`; the email link stays hidden until you replace its empty placeholder with a real address and set `placeholder` to `false`. `public/cv.pdf` is the downloaded CV file. Commit and push edits to publish them.

The project uses Astro 7 and requires Node.js 22.23.4 or newer. In Vercel, select Node 22 under **Project → Settings → General → Node.js Version** (or use the latest supported major).
