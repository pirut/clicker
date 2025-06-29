# Clerk Authentication Setup

This project has been integrated with Clerk for authentication using the Next.js App Router approach.

## Environment Variables

Create a `.env.local` file in the root of your project with the following Clerk environment variables:

```bash
# Clerk Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Zmlyc3QtaG9uZXliZWUtMTMuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_54XXAsZRZxpURcWN9BgfVUGA4FDK6lSIVlv3eul5b1
```

## What's Been Added

1. **Middleware** (`src/middleware.ts`): Uses `clerkMiddleware()` from `@clerk/nextjs/server`
2. **Layout** (`src/app/layout.tsx`): Wrapped with `<ClerkProvider>`
3. **Header Component** (`src/components/header.tsx`): Added authentication components
4. **Protected Dashboard** (`src/app/dashboard/page.tsx`): Example protected route using `currentUser()`

## Authentication Components

-   `<SignInButton />`: Button to trigger sign-in flow
-   `<SignUpButton />`: Button to trigger sign-up flow
-   `<UserButton />`: User profile button (shown when signed in)
-   `<SignedIn />`: Wrapper for content shown only to authenticated users
-   `<SignedOut />`: Wrapper for content shown only to unauthenticated users

## Protected Routes

The dashboard page demonstrates how to protect routes using the `currentUser()` helper:

```typescript
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Your protected content here
}
```

## Getting Started

1. Add the environment variables to `.env.local`
2. Run `npm run dev` to start the development server
3. Visit your app and test the authentication flow
4. Sign up or sign in to access the dashboard

## Clerk Dashboard

Visit [Clerk Dashboard](https://dashboard.clerk.com) to:

-   Configure authentication methods
-   Customize sign-in/sign-up pages
-   Manage users
-   Set up webhooks
-   Configure security settings
