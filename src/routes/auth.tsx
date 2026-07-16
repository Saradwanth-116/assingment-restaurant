import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Authentication — Tavola Reservations" },
      { name: "description", content: "Sign in or register to manage restaurant reservations." },
    ],
  }),
});
