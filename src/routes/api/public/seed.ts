import { createFileRoute } from "@tanstack/react-router";

// Seeds two demo accounts on first call. Safe to run multiple times.
export const Route = createFileRoute("/api/public/seed")({
  server: {
    handlers: {
      POST: async () => {
        const demos = [
          {
            email: "admin@demo.com",
            password: "password123",
            role: "admin" as const,
            name: "Admin",
          },
          {
            email: "user@demo.com",
            password: "password123",
            role: "user" as const,
            name: "Demo User",
          },
        ];

        for (const d of demos) {
          try {
            await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(d),
            });
          } catch (e) {
            console.error("Seed error", e);
          }
        }
        return Response.json({ ok: true });
      },
      GET: async () => Response.json({ hint: "POST to seed demo accounts" }),
    },
  },
});
