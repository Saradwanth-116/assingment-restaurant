import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tavola — Restaurant Reservations" },
      { name: "description", content: "Book a table at Tavola. Manage your reservations online." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    navigate({ to: token ? "/dashboard" : "/auth" });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Loading…
    </div>
  );
}
