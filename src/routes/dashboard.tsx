import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TIME_SLOTS, todayISO, formatDate } from "@/lib/reservations";
import { toast } from "sonner";
import { CalendarPlus, XCircle, Loader2, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My reservations — Tavola" },
      { name: "description", content: "View and manage your restaurant reservations." },
    ],
  }),
  component: Dashboard,
});

type RTable = { id: string; name: string; capacity: number };
type Reservation = {
  _id: string;
  reservationDate: string;
  timeSlot: string;
  guests: number;
  status: string;
  table: { _id: string; name: string; capacity: number } | null;
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

function Dashboard() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [tables, setTables] = useState<RTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState(TIME_SLOTS[3]);
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [takenTables, setTakenTables] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const loadTables = async () => {
    try {
      const res = await fetch("/api/tables", {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: any) => ({ ...d, id: d._id }));
        setTables(formatted);
        if (formatted.length && !tableId) setTableId(formatted[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadReservations = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const res = await fetch("/api/reservations", {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const taken = data
          .filter((r: any) => r.reservationDate === date && r.timeSlot === slot && r.status === "active")
          .map((r: any) => r.table?._id || r.table);
        setTakenTables(new Set(taken));
      }
    } catch(e) {}
  };

  useEffect(() => { loadTables(); }, []);
  useEffect(() => { if (user) loadReservations(); }, [user]);
  useEffect(() => { loadAvailability(); }, [date, slot]);

  const availableTables = tables.filter((t) => !takenTables.has(t.id) && t.capacity >= guests);

  const createReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!tableId) { toast.error("Pick a table"); return; }
    const chosen = tables.find((t) => t.id === tableId);
    if (!chosen) return;
    if (chosen.capacity < guests) { toast.error(`Table ${chosen.name} seats only ${chosen.capacity}.`); return; }
    if (takenTables.has(tableId)) { toast.error("That table is already booked for that slot."); return; }
    if (date < todayISO()) { toast.error("Please pick today or a future date."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tableId,
          reservationDate: date,
          timeSlot: slot,
          guests
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create reservation");
      } else {
        toast.success("Reservation confirmed");
        loadReservations();
        loadAvailability();
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success("Reservation cancelled");
        loadReservations();
        loadAvailability();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to cancel");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <AppHeader role={role} email={user.email ?? undefined} />
      
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-5"
      >
        <motion.div variants={itemVariants} className="md:col-span-2 h-fit">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarPlus className="h-5 w-5 text-primary" /> New reservation
              </CardTitle>
              <CardDescription>Pick a date, time, party size, and table.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createReservation} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Time slot</Label>
                  <Select value={slot} onValueChange={setSlot}>
                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Table</Label>
                  <Select value={tableId} onValueChange={setTableId}>
                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Choose a table" /></SelectTrigger>
                    <SelectContent>
                      {tables.map((t) => {
                        const taken = takenTables.has(t.id);
                        const small = t.capacity < guests;
                        return (
                          <SelectItem key={t.id} value={t.id} disabled={taken || small}>
                            {t.name} · seats {t.capacity}
                            {taken ? " · booked" : small ? " · too small" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground font-medium">
                    {availableTables.length} table(s) available for this slot.
                  </p>
                </div>
                <Button type="submit" className="w-full shadow-md" disabled={submitting || availableTables.length === 0}>
                  {submitting ? "Booking…" : "Confirm reservation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-3">
          <Card className="glass-panel min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-xl">My reservations</CardTitle>
              <CardDescription>Your past and upcoming bookings.</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 w-full bg-primary/5 animate-pulse rounded-md border border-primary/10" />
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center opacity-70">
                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
                  <p className="text-sm text-muted-foreground">No reservations yet.</p>
                </div>
              ) : (
                <div className="rounded-md border border-primary/10 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-primary/5">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {reservations.map((r) => (
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
                            <TableCell>{r.guests}</TableCell>
                            <TableCell>{r.table?.name ?? "—"}</TableCell>
                            <TableCell>
                              <Badge variant={r.status === "active" ? "default" : "secondary"} className="shadow-sm">
                                {r.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {r.status === "active" && (
                                <Button variant="ghost" size="sm" onClick={() => cancel(r._id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <XCircle className="h-4 w-4 mr-1 text-destructive" /> <span className="text-destructive">Cancel</span>
                                </Button>
                              )}
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
      </motion.main>
    </div>
  );
}
