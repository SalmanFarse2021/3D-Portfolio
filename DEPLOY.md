# Deployment Guide for Vercel

This project is fully configured for deployment on [Vercel](https://vercel.com).

## Prerequisites

1.  A GitHub account.
2.  A Vercel account.
3.  A Google Gemini API Key.

## Steps to Deploy

1.  **Push to GitHub**:
    Ensure your latest code is pushed to your GitHub repository.
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```

2.  **Import to Vercel**:
    - Go to your Vercel Dashboard.
    - Click **"Add New..."** -> **"Project"**.
    - Import your `3D-Portfolio` repository.

3.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect `Next.js`.
    - **Root Directory**: `./` (default).
    - **Build Command**: `npm run build` (default).
    - **Output Directory**: `.next` (default).

4.  **Environment Variables** (CRITICAL):
    - Expand the **"Environment Variables"** section.
    - Add the following key-value pair:
        - **Key**: `GEMINI_API_KEY`
        - **Value**: `your_actual_api_key_starts_with_AIza...`

5.  **Deploy**:
    - Click **"Deploy"**.
    - Wait for the build to complete (usually 1-2 minutes).

## Troubleshooting

-   **Build Fails**: Check the "Build Logs" in Vercel. If it's a lint error, run `npm run lint` locally to fix it.
-   **AI Not Working**: Ensure the `GEMINI_API_KEY` is set correctly in the Vercel Environment Variables. Redeploy if you added the key *after* the initial deployment.

## Post-Deployment

-   Your site will be live at `https://your-project-name.vercel.app`.
-   You can connect a custom domain in Vercel Settings > Domains.
