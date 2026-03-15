## Formex

Formex (Formes) is a Next.js 16 application for Driploma Institute where INS formats become easy to manage. No more manual work. It combines typed forms, PDF generation, and modern UI components. It uses:

- **Next.js** for the app framework
- **React 19**
- **Drizzle ORM** and **drizzle-kit** for database schema and migrations
- **Neon / PostgreSQL** (via `@neondatabase/serverless`)
- **Better Auth** for authentication
- **Biome** for linting and formatting

### Prerequisites

- **Node.js** 20+ (recommended LTS)
- **Package manager**: **Bun** (this project assumes Bun only)
- **PostgreSQL database** (local or hosted, e.g. Neon)

### 1. Install dependencies

From the project root (`formex`):

```bash
bun install
```
If you don't have `bun` installed on your machine install then [Click Here](https://bun.com/docs/installation)

### 2. Configure environment variables

Create a `.env.local` file in the project root (Next.js will auto‑load it). You can copy everything from `.env.example` and then fill in real values:

```bash
# Get database url from https://neon.tech (or your own Postgres)
DATABASE_URL="postgres://user:password@host:port/dbname"

# Get the UploadThing token from https://uploadthing.com
UPLOADTHING_TOKEN="<token>"

# Better Auth secret used for encryption and hashing.
# Generate at least a 32‑character high‑entropy value:
# - via the Better Auth docs "Generate Secret" button, or
# - using: openssl rand -base64 32
BETTER_AUTH_SECRET="<secret>"

# Base URL of your app. In development this should match the port you run on.
BETTER_AUTH_URL="http://localhost:3000"
```

If you are using Neon, paste the connection string from the Neon dashboard into `DATABASE_URL`.

### 3. Set up the database

This project uses **drizzle-kit** for schema management.

- **Push schema to the database**:

```bash
bun run db:push
```

- (Optional) **Open Drizzle Studio** to inspect the schema:

```bash
bun run db:studio
```

### 4. Generate Better Auth schema (if needed)

When you update your Better Auth configuration, regenerate the TypeScript schema:

```bash
bun run auth:generate
```

This writes to `src/server/db/auth-schema.ts`.

### 5. Run the development server

Start the Next.js dev server:

```bash
bun dev
```

Then open `http://localhost:3000` in your browser.

### 6. Linting and formatting

This project uses **Biome**:

- **Check linting**:

```bash
bun run lint
```

- **Auto‑fix + format** (unsafe, may rewrite code):

```bash
bun run lint:unsafe
```

- **Format code**:

```bash
bun run format
```

### 7. Production build

To create and run a production build:

```bash
bun run build
bun start
```

### 8. Project scripts overview

From `package.json`:

- **`dev`**: start Next.js dev server (`bun dev`)
- **`build`**: build the Next.js app for production (`bun run build`)
- **`start`**: run the production server (`bun start`)
- **`lint`**: run Biome checks (`bun run lint`)
- **`lint:unsafe`**: run Biome checks with auto‑fixes (`bun run lint:unsafe`)
- **`format`**: format files with Biome (`bun run format`)
- **`db:push`**: apply Drizzle schema to the database (`bun run db:push`)
- **`db:studio`**: open Drizzle Studio (`bun run db:studio`)
- **`auth:generate`**: generate Better Auth schema into `src/server/db/auth-schema.ts` (`bun run auth:generate`)

Once you have dependencies installed, environment variables configured, and the database schema pushed, you should be able to run `bun dev` and start working on the app.
