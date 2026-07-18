import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { UtensilsCrossed, Calendar, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AppRole } from "@/hooks/useAuth";

export function BottomDock({ role, email }: { role: AppRole | null; email?: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = async () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    navigate({ to: "/auth" });
  };

  if (!role) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-2 rounded-full glass-panel border border-primary/10 shadow-lg bg-background/60 backdrop-blur-md transition-all duration-300 origin-bottom hover:scale-150">
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/restaurants">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-12 h-12 ${
                    location.pathname.startsWith('/restaurants') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <UtensilsCrossed className="w-5 h-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={14} className="px-4 py-2">
              <p className="text-base font-semibold">Restaurants</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-12 h-12 ${
                    location.pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={14} className="px-4 py-2">
              <p className="text-base font-semibold">My Reservations</p>
            </TooltipContent>
          </Tooltip>

          {role === "admin" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-12 h-12 ${
                      location.pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={14} className="px-4 py-2">
                <p className="text-base font-semibold">Admin Dashboard</p>
              </TooltipContent>
            </Tooltip>
          )}

          <div className="w-[1px] h-8 bg-border mx-1" />

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-12 h-12 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={14} className="px-4 py-2">
                <p className="text-base font-semibold">Profile</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent side="top" align="center" className="w-auto p-4 mb-2 rounded-2xl shadow-xl">
              <div className="flex flex-col gap-3 items-center">
                <span className="text-sm font-medium text-muted-foreground">{email}</span>
                <Button variant="outline" size="sm" onClick={signOut} className="w-full rounded-full">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </div>
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </TooltipProvider>
  );
}
