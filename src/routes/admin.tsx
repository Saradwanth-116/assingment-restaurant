import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Tavola" },
      { name: "description", content: "Administrator view for all reservations and tables." },
    ],
  }),
});
