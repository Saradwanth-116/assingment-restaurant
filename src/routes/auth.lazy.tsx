import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UtensilsCrossed, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createLazyFileRoute("/auth")({
  
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"customer" | "admin">("customer");

  // User State
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userMode, setUserMode] = useState<"signin" | "signup">("signin");
  const [userLoading, setUserLoading] = useState(false);

  // Admin State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const onUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    const endpoint = userMode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const body =
      userMode === "signin"
        ? JSON.stringify({ email: userEmail, password: userPassword })
        : JSON.stringify({
            name: userName,
            email: userEmail,
            password: userPassword,
            role: "user",
          });

    try {
      const res = await fetch(`${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || (userMode === "signin" ? "Login failed" : "Registration failed"),
        );
      } else {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("auth-change"));
        toast.success(userMode === "signin" ? "Signed in" : "Account created");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUserLoading(false);
    }
  };

  const onAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
      } else {
        if (data.user.role !== "admin") {
          toast.error("This portal is for administrators only");
        } else {
          localStorage.setItem("token", data.token);
          window.dispatchEvent(new Event("auth-change"));
          toast.success("Admin signed in");
          navigate({ to: "/admin" });
        }
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden relative bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 text-center relative z-10"
      >
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-md border border-primary/20 shadow-xl shadow-primary/5">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Tavola Reservations</h1>
        <p className="text-muted-foreground mt-2 text-lg">Welcome! Please choose your portal.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex gap-4 mb-8 z-10"
      >
        <Button
          variant={activeTab === "customer" ? "default" : "secondary"}
          className="w-36 flex gap-2 shadow-md transition-all duration-300"
          onClick={() => setActiveTab("customer")}
        >
          <User className="h-4 w-4" /> Customer
        </Button>
        <Button
          variant={activeTab === "admin" ? "default" : "secondary"}
          className="w-36 flex gap-2 shadow-md transition-all duration-300"
          onClick={() => setActiveTab("admin")}
        >
          <ShieldCheck className="h-4 w-4" /> Admin
        </Button>
      </motion.div>

      <div className="w-full max-w-md relative z-10 perspective-1000">
        <AnimatePresence mode="wait">
          {activeTab === "customer" && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, rotateX: 10, y: 20 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -10, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Card className="glass-panel overflow-hidden">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Customer Portal</CardTitle>
                  <CardDescription>Book and manage reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onUserSubmit} className="space-y-4">
                    <AnimatePresence>
                      {userMode === "signup" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                          animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="userName">Name</Label>
                          <Input
                            id="userName"
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="bg-background/50"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPassword">Password</Label>
                      <Input
                        id="userPassword"
                        type="password"
                        required
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full shadow-lg hover:shadow-primary/25 transition-all"
                      disabled={userLoading}
                    >
                      {userLoading
                        ? "Please wait..."
                        : userMode === "signin"
                          ? "Sign in"
                          : "Create account"}
                    </Button>
                  </form>

                  <div className="mt-5 text-center text-sm">
                    {userMode === "signin" ? (
                      <p>
                        Don't have an account?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto font-semibold"
                          onClick={() => setUserMode("signup")}
                        >
                          Sign up
                        </Button>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto font-semibold"
                          onClick={() => setUserMode("signin")}
                        >
                          Sign in
                        </Button>
                      </p>
                    )}
                  </div>

                  <div className="mt-6 border-t border-border/40 pt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUserMode("signin");
                        setUserEmail("user@demo.com");
                        setUserPassword("password123");
                      }}
                      className="w-full opacity-70 hover:opacity-100"
                    >
                      Quick fill: Demo Customer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, rotateX: 10, y: 20 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -10, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Card className="glass-panel overflow-hidden border-primary/20">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-900/5 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <CardTitle className="text-2xl">Administrator Portal</CardTitle>
                  <CardDescription>Manage tables and overview bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onAdminSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full shadow-lg"
                      disabled={adminLoading}
                    >
                      {adminLoading ? "Signing in..." : "Sign in securely"}
                    </Button>
                  </form>

                  <div className="mt-[56px] border-t border-border/40 pt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAdminEmail("admin@demo.com");
                        setAdminPassword("password123");
                      }}
                      className="w-full opacity-70 hover:opacity-100"
                    >
                      Quick fill: Demo Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
