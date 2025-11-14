This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Haiseven Frontend Auth

This app integrates with Haiseven API (Laravel Sanctum) using bearer tokens.

### Environment

Set the API base URL (development default is `http://localhost:8000`):

```bash
# fish shell
set -Ux NEXT_PUBLIC_API_URL http://localhost:8000
```

### Routes

- `/register` – user registration
- `/login` – user login
- `/dashboard` – protected profile overview
- `/focus` – Daily Focus (dynamic cards, history)
- `/gratitude` – Gratitude Jar (textarea + list)
- `/morning-page` – Morning Page (3-minute brain dump with idle blur)
- `/affirmation` – Positive Fortune Cookie (random colorful affirmation grid)
- `/brain-warmup` – Fast math multiple-choice game (streak bonus + sounds + leaderboard)
- `/muse` – Morning Muse creative prompt generator (random ideation spark)

Global auth state is managed with Zustand (`app/store/auth.ts`). The `useAuth` hook (`app/hooks/useAuth.ts`) provides `login`, `register`, `logout`, and `getUser`.

Notes:
- Morning Page implements a 3-minute timer and blurs text after 5 seconds idle to discourage editing.
- Navigation is responsive with a mobile hamburger menu (`app/components/Header.tsx`).
- Affirmation uses a gradient shuffle grid after you fetch the first quote.
- Brain Warm-up provides safe division & multiplication, streak visual bonus, optional sounds, and stores scores (global + personal top via backend).
- Morning Muse fetches a random creative prompt from backend (`GET /api/muse/random`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
