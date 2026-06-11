The project report is in the repository root:

Herman_DAT-076_report.pdf

The demo can be viewed here: https://www.youtube.com/watch?v=qTssqkHIZp8

Project structure:

client/                 
  src/
    api/                
    components/         Shared layout components
    features/           Domain features, each with its own components/, 
                        hooks/ and, where needed, context/ and lib/
    pages/              Thin page shells composed from features one per route
    hooks/, lib/        Shared hooks and utilities
    types/              TypeScript interfaces mirroring the server models
    App.tsx             

server/                 
  db/
    schemas/            Drizzle table definitions
    migrations/         Generated SQL migrations
    index.ts            DB connection
    seed.ts             Seed data (demo accounts, lock systems, keys)
  src/
    model/              TypeScript interfaces for the domain entities
    router/             Express routers
    service/            Business logic
    start.ts            Express app setup
    index.ts            Entry point


Seeded demo accounts (after first start): 

- (admin) alice@example.com / password 
- (user) ulf@example.com / password 
