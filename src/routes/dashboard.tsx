import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My reservations — Tavola" },
      { name: "description", content: "View and manage your restaurant reservations." },
    ],
  }),
});
