# 3D AI Portfolio

A modern, interactive portfolio website built with Next.js, React Three Fiber, and OpenAI GPT-5.1.

## 🚀 Features

-   **3D Hero Section**: Interactive floating geometry and particle fields using React Three Fiber.
-   **AI Chat Assistant**: Integrated OpenAI (GPT-5.1) chatbot with real-time GitHub data access.
-   **Live GitHub Integration**: Fetches your latest repositories and stats directly from GitHub.
-   **Qualifications Timeline**: A sleek, tabbed interface for viewing Education and Experience.
-   **Smart Project Grid**: Progressive loading and filtering for project showcases.
-   **Responsive Design**: Fully optimized with a premium glassmorphism aesthetic.

## 🛠️ Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS
-   **3D Graphics**: React Three Fiber / Drei
-   **AI**: OpenAI API (GPT-5.1)
-   **Data Fetching**: Octokit (GitHub API)
-   **Language**: TypeScript

## 🏃‍♂️ Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/portfolio.git
    cd portfolio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory:
    ```bash
    OPENAI_API_KEY=your_openai_api_key
    GITHUB_TOKEN=your_github_pat
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 📦 Deployment

This project is optimized for **Vercel**. Ensure you add `OPENAI_API_KEY` and `GITHUB_TOKEN` to your deployment environment variables.

---

Built with ❤️ by Salman Farse
