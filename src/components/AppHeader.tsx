import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, LogOut } from "lucide-react";
import type { AppRole } from "@/hooks/useAuth";

export function AppHeader({ role, email }: { role: AppRole | null; email?: string }) {
  const navigate = useNavigate();
  const signOut = async () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    navigate({ to: "/auth" });
  };
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-primary/10 shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Tavola</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              My reservations
            </Button>
          </Link>
          {role === "admin" && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </Link>
          )}
          <span className="text-xs text-muted-foreground hidden sm:inline ml-2">{email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
