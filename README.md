# SpinSync 

Ever have that itch to play some table tennis but can't find a partner or an open table? I've got you covered.

## What's this all about?

SpinSync is a web app designed to connect table tennis enthusiasts. Whether you're looking for a casual match, a competitive game, or just an available table, my goal is to make it happen. Find players, find tables, and get your game on.

## Features

*   **Find Players:** Discover and connect with other players in your area.
*   **Find Tables:** Locate nearby table tennis tables and check their availability.
*   **Real-time Chat:** Coordinate with other players to schedule your next match.
*   **Player Profiles:** Set up your profile, share your skill level, and manage your games.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Backend & Database:** Supabase
*   **Styling:** Tailwind CSS & shadcn/ui
*   **Package Manager:** Bun

## Getting Started

Ready to get the project running locally? Here’s how.

### 1. Clone the Repository

First things first, clone the repository to your local machine.

```bash
git clone https://github.com/apoorvcurry21/spin-sync.git
cd spin-sync
```

### 2. Install Dependencies

I use Bun for package management. If you don't have it, you'll need to [install it first](https://bun.sh/docs/installation).

Once you have Bun, install the project dependencies:

```bash
bun install
```

### 3. Set up Your Environment

This project uses Supabase for the backend.

1.  Create a new project on your [Supabase dashboard](https://app.supabase.io/).
2.  Go to your project’s **Settings > API**.
3.  In the root of your local project, create a new file named `.env`.
4.  Copy the `Project URL` and `anon` `public` key from Supabase and add them to your `.env` file like this:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 4. Set up the Database

The database schema is managed with Supabase migrations. To get your local database in sync, you'll need the [Supabase CLI](https://supabase.com/docs/guides/cli).

Once you have the CLI installed and linked to your Supabase account (`supabase login`), run the following command to apply the migrations:

```bash
supabase db push
```

*Note: If you're starting fresh and want to run the database locally, you can use `supabase start` and then `supabase db reset`.*

### 5. Run the Development Server

You're all set! Start the local development server with:

```bash
bun run dev
```

The application should now be running at `http://localhost:5173`.

## How to Contribute

Spotted a bug, have a feature idea, or want to improve something? I'd be glad to take your help. Feel free to open an issue or submit a pull request.
