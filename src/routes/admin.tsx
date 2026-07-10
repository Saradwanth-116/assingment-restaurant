import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate, todayISO } from "@/lib/reservations";
import { toast } from "sonner";
import { Plus, Trash2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Tavola" },
      { name: "description", content: "Administrator view for all reservations and tables." },
    ],
  }),
  component: AdminPage,
});

type RTable = { id: string; name: string; capacity: number };
type ResRow = {
  _id: string;
  reservationDate: string;
  timeSlot: string;
  guests: number;
  status: string;
  user: { _id: string, name: string } | null;
  table: { name: string } | null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ResRow[]>([]);
  const [tables, setTables] = useState<RTable[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [newTable, setNewTable] = useState({ name: "", capacity: 2 });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (role !== "admin") { navigate({ to: "/dashboard" }); return; }
  }, [authLoading, user, role, navigate]);

  const load = async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        let data = await res.json();
        if (dateFilter) data = data.filter((r: any) => r.reservationDate === dateFilter);
        setRows(data);
      } else {
        toast.error("Failed to load reservations");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setDataLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const res = await fetch("/api/tables", {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: any) => ({ ...d, id: d._id }));
        setTables(formatted);
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  useEffect(() => { if (role === "admin") { load(); loadTables(); } }, [role]);
  useEffect(() => { if (role === "admin") load(); }, [dateFilter]);

  const cancel = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success("Cancelled");
        load();
      } else {
        toast.error("Failed to cancel");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const remove = async (id: string) => {
    await cancel(id);
  };

  const addTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.name.trim()) return;
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTable.name.trim(), capacity: Number(newTable.capacity) })
      });
      if (res.ok) {
        setNewTable({ name: "", capacity: 2 });
        toast.success("Table added");
        loadTables();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add table");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const removeTable = async (id: string) => {
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success("Table removed");
        loadTables();
      } else {
        toast.error("Failed to remove table");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  if (authLoading || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <AppHeader role={role} email={user?.email ?? undefined} />
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <Tabs defaultValue="reservations">
          <TabsList className="mb-4 bg-background/50 backdrop-blur-md">
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <motion.div variants={itemVariants}>
              <Card className="glass-panel min-h-[500px]">
                <CardHeader className="flex flex-row items-end justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-2xl">All reservations</CardTitle>
                    <CardDescription>View, filter by date, and cancel any reservation.</CardDescription>
                  </div>
                  <div className="flex items-end gap-2">
                    <div>
                      <Label className="text-xs">Filter by date</Label>
                      <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-background/50" />
                    </div>
                    {dateFilter && (
                      <Button variant="outline" size="sm" onClick={() => setDateFilter("")}>Clear</Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="space-y-4 py-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 w-full bg-primary/5 animate-pulse rounded-md border border-primary/10" />
                      ))}
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                      <p className="text-sm text-muted-foreground">No reservations found.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border border-primary/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-primary/5">
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead>Table</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {rows.map((r) => (
                              <motion.tr 
                                key={r._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                                layout
                                className="group hover:bg-primary/5 border-b border-primary/5"
                              >
                                <TableCell className="whitespace-nowrap font-medium">{formatDate(r.reservationDate)}</TableCell>
                                <TableCell>{r.timeSlot}</TableCell>
                                <TableCell className="text-sm font-medium">{r.user?.name ?? r.user?._id?.slice(0, 8)}</TableCell>
                                <TableCell>{r.guests}</TableCell>
                                <TableCell>{r.table?.name ?? "—"}</TableCell>
                                <TableCell><Badge variant={r.status === "active" ? "default" : "secondary"} className="shadow-sm">{r.status}</Badge></TableCell>
                                <TableCell className="text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {r.status === "active" && (
                                    <Button variant="ghost" size="sm" onClick={() => cancel(r._id)}>
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm" onClick={() => remove(r._id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tables">
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div variants={itemVariants} className="md:col-span-1 h-fit">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Plus className="h-5 w-5 text-primary" /> Add table</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addTable} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={newTable.name} onChange={(e) => setNewTable((v) => ({ ...v, name: e.target.value }))} placeholder="T7" required className="bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Capacity</Label>
                        <Input type="number" min={1} max={20} value={newTable.capacity} onChange={(e) => setNewTable((v) => ({ ...v, capacity: Number(e.target.value) || 1 }))} className="bg-background/50" />
                      </div>
                      <Button type="submit" className="w-full shadow-md">Add table</Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2">
                <Card className="glass-panel min-h-[400px]">
                  <CardHeader>
                    <CardTitle className="text-xl">Tables</CardTitle>
                    <CardDescription>Restaurant tables available for booking.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-primary/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-primary/5">
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {tables.map((t) => (
                              <motion.tr 
                                key={t.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                layout
                                className="group hover:bg-primary/5 border-b border-primary/5"
                              >
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell>{t.capacity}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => removeTable(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-4 text-center">Today is {formatDate(todayISO())}.</p>
      </motion.main>
    </div>
  );
}
