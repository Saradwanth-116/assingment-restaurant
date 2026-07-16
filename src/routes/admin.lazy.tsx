import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, todayISO, TIME_SLOTS } from "@/lib/reservations";
import { toast } from "sonner";
import { UtensilsCrossed, Plus, Trash2, CalendarX, Edit2, Loader2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createLazyFileRoute("/admin")({
  
  component: AdminPage,
});

type RTable = { id: string; name: string; capacity: number; quantity: number };
type ResRow = {
  _id: string;
  reservationDate: string;
  timeSlot: string;
  guests: number;
  status: string;
  user: { _id: string; name: string } | null;
  table: { _id: string; name: string; capacity: number; restaurant?: { _id: string; name: string } } | null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ResRow[]>([]);
  const [tables, setTables] = useState<RTable[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("reservations");
  const [newTable, setNewTable] = useState({ name: "", capacity: 2, quantity: 1, restaurantId: "" });
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", location: "", cuisine: "", costForTwo: 500, menuLink: "", imageUrl: "" });
  const [editingRes, setEditingRes] = useState<ResRow | null>(null);
  const [editResForm, setEditResForm] = useState({
    date: "",
    timeSlot: "",
    guests: 2,
    restaurantId: "",
    tableId: "",
  });
  const [updatingRes, setUpdatingRes] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [editRestaurantForm, setEditRestaurantForm] = useState({ name: "", location: "", cuisine: "", costForTwo: 500, menuLink: "", imageUrl: "" });
  const [updatingRestaurant, setUpdatingRestaurant] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (role !== "admin") {
      navigate({ to: "/dashboard" });
      return;
    }
  }, [authLoading, user, role, navigate]);

  const load = async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        let data = await res.json();
        if (dateFilter)
          data = data.filter((r: { reservationDate: string }) => r.reservationDate === dateFilter);
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: { _id: string; [key: string]: unknown }) => ({
          ...d,
          id: d._id,
        }));
        setTables(formatted as RTable[]);
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const loadRestaurants = async () => {
    try {
      const res = await fetch("/api/restaurants", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
        if (data.length > 0 && !newTable.restaurantId) {
          setNewTable(prev => ({ ...prev, restaurantId: data[0]._id }));
        }
      }
    } catch (e) {
      toast.error("Network error loading restaurants");
    }
  };

  useEffect(() => {
    if (role === "admin") {
      load();
      loadTables();
      loadRestaurants();
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (role === "admin") load();
  }, [dateFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        toast.success("Reservation deleted");
        load();
      } else {
        toast.error("Failed to delete reservation");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleEditResClick = (r: ResRow) => {
    setEditingRes(r);
    setEditResForm({
      date: r.reservationDate,
      timeSlot: r.timeSlot,
      guests: r.guests,
      restaurantId: r.table?.restaurant?._id || "",
      tableId: r.table?._id || "",
    });
  };

  const updateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes || !editResForm.tableId) return;
    setUpdatingRes(true);
    try {
      const res = await fetch(`/api/reservations/${editingRes._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tableId: editResForm.tableId,
          reservationDate: editResForm.date,
          timeSlot: editResForm.timeSlot,
          guests: editResForm.guests,
        }),
      });
      if (res.ok) {
        toast.success("Reservation updated");
        setEditingRes(null);
        load();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update reservation");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setUpdatingRes(false);
    }
  };

  const addTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.name.trim() || !newTable.restaurantId) return;
    try {
      const isEditing = !!editingTableId;
      const url = isEditing ? `/api/tables/${editingTableId}` : "/api/tables";
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          name: newTable.name.trim(), 
          capacity: Number(newTable.capacity), 
          quantity: Number(newTable.quantity),
          restaurantId: newTable.restaurantId 
        }),
      });
      if (res.ok) {
        setNewTable({ name: "", capacity: 2, quantity: 1, restaurantId: newTable.restaurantId });
        setEditingTableId(null);
        toast.success(isEditing ? "Table updated" : "Table added");
        loadTables();
      } else {
        const data = await res.json();
        toast.error(data.message || `Failed to ${isEditing ? "update" : "add"} table`);
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleEditTable = (t: any) => {
    setEditingTableId(t.id);
    setNewTable({
      name: t.name,
      capacity: t.capacity,
      quantity: t.quantity || 1,
      restaurantId: t.restaurant?._id || t.restaurant || "",
    });
  };

  const cancelEditTable = () => {
    setEditingTableId(null);
    setNewTable({ name: "", capacity: 2, quantity: 1, restaurantId: restaurants.length > 0 ? restaurants[0]._id : "" });
  };

  const removeTable = async (id: string) => {
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
  const addRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurant.name.trim()) return;
    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          name: newRestaurant.name.trim(), 
          location: { address: newRestaurant.location },
          cuisine: newRestaurant.cuisine,
          costForTwo: Number(newRestaurant.costForTwo),
          menuLink: newRestaurant.menuLink.trim() || undefined,
          images: newRestaurant.imageUrl.trim() ? [newRestaurant.imageUrl.trim()] : undefined
        }),
      });
      if (res.ok) {
        setNewRestaurant({ name: "", location: "", cuisine: "", costForTwo: 500, menuLink: "", imageUrl: "" });
        toast.success("Restaurant added");
        loadRestaurants();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add restaurant");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const removeRestaurant = async (id: string) => {
    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        toast.success("Restaurant removed");
        loadRestaurants();
      } else {
        toast.error("Failed to remove restaurant");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleEditRestaurantClick = (r: any) => {
    setEditingRestaurantId(r._id);
    setEditRestaurantForm({
      name: r.name || "",
      location: r.location?.address || "",
      cuisine: r.cuisine || "",
      costForTwo: r.costForTwo || 500,
      menuLink: r.menuLink || "",
      imageUrl: r.images?.[0] || ""
    });
  };

  const updateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurantId || !editRestaurantForm.name.trim()) return;
    setUpdatingRestaurant(true);
    try {
      const res = await fetch(`/api/restaurants/${editingRestaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: editRestaurantForm.name.trim(),
          location: { address: editRestaurantForm.location },
          cuisine: editRestaurantForm.cuisine,
          costForTwo: Number(editRestaurantForm.costForTwo),
          menuLink: editRestaurantForm.menuLink.trim() || undefined,
          images: editRestaurantForm.imageUrl.trim() ? [editRestaurantForm.imageUrl.trim()] : undefined
        }),
      });
      if (res.ok) {
        toast.success("Restaurant updated");
        setEditingRestaurantId(null);
        loadRestaurants();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update restaurant");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setUpdatingRestaurant(false);
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
        className="container mx-auto px-4 py-8"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-background/50 backdrop-blur-md">
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <motion.div variants={itemVariants}>
              <Card className="glass-panel min-h-[500px]">
                <CardHeader className="flex flex-row items-end justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-2xl">All reservations</CardTitle>
                    <CardDescription>
                      View, filter by date, and cancel any reservation.
                    </CardDescription>
                  </div>
                  <div className="flex items-end gap-2">
                    <div>
                      <Label className="text-xs">Filter by date</Label>
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    {dateFilter && (
                      <Button variant="outline" size="sm" onClick={() => setDateFilter("")}>
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="space-y-4 py-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-12 w-full bg-primary/5 animate-pulse rounded-md border border-primary/10"
                        />
                      ))}
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                      <p className="text-sm text-muted-foreground">No reservations found.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border border-primary/10 overflow-x-auto">
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
                                <TableCell className="whitespace-nowrap font-medium">
                                  {formatDate(r.reservationDate)}
                                </TableCell>
                                <TableCell>{r.timeSlot}</TableCell>
                                <TableCell className="text-sm font-medium">
                                  {r.user?.name ?? r.user?._id?.slice(0, 8)}
                                </TableCell>
                                <TableCell>{r.guests}</TableCell>
                                <TableCell>{r.table?.name ?? "—"}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={r.status === "active" ? "default" : "secondary"}
                                    className="shadow-sm"
                                  >
                                    {r.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-1 transition-opacity">
                                  {r.status === "active" && (
                                    <>
                                      <Button variant="ghost" size="sm" onClick={() => handleEditResClick(r)}>
                                        <Edit2 className="h-4 w-4 text-primary" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => cancel(r._id)}>
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
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

          <TabsContent value="restaurants">
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div variants={itemVariants} className="md:col-span-1 h-fit">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Plus className="h-5 w-5 text-primary" /> Add restaurant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addRestaurant} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={newRestaurant.name}
                          onChange={(e) => setNewRestaurant((v) => ({ ...v, name: e.target.value }))}
                          placeholder="Spice Garden"
                          required
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={newRestaurant.location}
                          onChange={(e) => setNewRestaurant((v) => ({ ...v, location: e.target.value }))}
                          placeholder="123 Main St"
                          required
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cuisine</Label>
                        <Input
                          value={newRestaurant.cuisine}
                          onChange={(e) => setNewRestaurant((v) => ({ ...v, cuisine: e.target.value }))}
                          placeholder="Indian"
                          required
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cost for Two (₹)</Label>
                        <Input
                          type="number"
                          value={newRestaurant.costForTwo}
                          onChange={(e) => setNewRestaurant((v) => ({ ...v, costForTwo: Number(e.target.value) || 0 }))}
                          required
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Menu Link (Optional)</Label>
                        <Input
                          value={newRestaurant.menuLink}
                          onChange={(e) => setNewRestaurant((v) => ({ ...v, menuLink: e.target.value }))}
                          placeholder="https://drive.google.com/..."
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <Input
                          value={newRestaurant.imageUrl}
                          onChange={(e) => setNewRestaurant((v) => ({ ...v, imageUrl: e.target.value }))}
                          placeholder="https://images.unsplash.com/..."
                          className="bg-background/50"
                        />
                      </div>
                      <Button type="submit" className="w-full shadow-md">
                        Add restaurant
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2">
                <Card className="glass-panel min-h-[400px]">
                  <CardHeader>
                    <CardTitle className="text-xl">Restaurants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-primary/10 overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-primary/5">
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Cuisine</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {restaurants.map((r) => (
                              <motion.tr
                                key={r._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                layout
                                className="group hover:bg-primary/5 border-b border-primary/5"
                              >
                                <TableCell className="font-medium">{r.name}</TableCell>
                                <TableCell>{r.cuisine}</TableCell>
                                <TableCell>{r.location.address}</TableCell>
                                <TableCell className="text-right space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRestaurantClick(r)}
                                    className="transition-opacity"
                                  >
                                    <Edit2 className="h-4 w-4 text-primary" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRestaurant(r._id)}
                                    className="transition-opacity"
                                  >
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

          <TabsContent value="tables">
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div variants={itemVariants} className="md:col-span-1 h-fit">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Plus className="h-5 w-5 text-primary" /> Add table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addTable} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Restaurant</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newTable.restaurantId}
                          onChange={(e) => {
                            if (e.target.value === "ADD_NEW") {
                              setActiveTab("restaurants");
                            } else {
                              setNewTable((v) => ({ ...v, restaurantId: e.target.value }));
                            }
                          }}
                          required
                        >
                          <option value="" disabled>Select a restaurant</option>
                          {restaurants.map((r) => (
                            <option key={r._id} value={r._id}>{r.name}</option>
                          ))}
                          <option value="ADD_NEW" className="font-bold text-primary bg-primary/5">+ Add new restaurant</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={newTable.name}
                          onChange={(e) => setNewTable((v) => ({ ...v, name: e.target.value }))}
                          placeholder="T7"
                          required
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Capacity</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={newTable.capacity}
                          onChange={(e) =>
                            setNewTable((v) => ({ ...v, capacity: Number(e.target.value) || 1 }))
                          }
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={newTable.quantity}
                          onChange={(e) =>
                            setNewTable((v) => ({ ...v, quantity: Number(e.target.value) || 1 }))
                          }
                          className="bg-background/50"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 shadow-md">
                          {editingTableId ? "Update table" : "Add table"}
                        </Button>
                        {editingTableId && (
                          <Button type="button" variant="outline" onClick={cancelEditTable}>
                            Cancel
                          </Button>
                        )}
                      </div>
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
                    <div className="rounded-md border border-primary/10 overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-primary/5">
                          <TableRow>
                            <TableHead>Restaurant</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Quantity</TableHead>
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
                                <TableCell className="text-muted-foreground">
                                  {/* @ts-ignore */}
                                  {t.restaurant?.name || "Unknown"}
                                </TableCell>
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell>{t.capacity}</TableCell>
                                <TableCell>{t.quantity || 1}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditTable(t)}
                                    className="transition-opacity mr-1"
                                  >
                                    <Edit2 className="h-4 w-4 text-primary" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTable(t.id)}
                                    className="transition-opacity"
                                  >
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
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Today is {formatDate(todayISO())}.
        </p>

        {/* Edit Reservation Dialog */}
        <Dialog open={!!editingRes} onOpenChange={(open) => !open && setEditingRes(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Reservation</DialogTitle>
              <DialogDescription>Modify the reservation details below.</DialogDescription>
            </DialogHeader>
            {editingRes && (
              <form onSubmit={updateReservation} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Restaurant</Label>
                  <Select 
                    value={editResForm.restaurantId} 
                    onValueChange={(val) => setEditResForm(prev => ({ ...prev, restaurantId: val, tableId: "" }))}
                  >
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                    <SelectContent>
                      {restaurants.map(r => (
                        <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Table</Label>
                  <Select 
                    value={editResForm.tableId} 
                    onValueChange={(val) => setEditResForm(prev => ({ ...prev, tableId: val }))}
                  >
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select table" /></SelectTrigger>
                    <SelectContent>
                      {tables.filter(t => (t as any).restaurant?._id === editResForm.restaurantId || (t as any).restaurant === editResForm.restaurantId).map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name} (Seats {t.capacity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date" 
                      min={todayISO()}
                      value={editResForm.date} 
                      onChange={(e) => setEditResForm(prev => ({ ...prev, date: e.target.value }))}
                      required 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time slot</Label>
                    <Select 
                      value={editResForm.timeSlot} 
                      onValueChange={(val) => setEditResForm(prev => ({ ...prev, timeSlot: val }))}
                    >
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Time" /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input 
                    type="number" 
                    min={1} max={20} 
                    value={editResForm.guests} 
                    onChange={(e) => setEditResForm(prev => ({ ...prev, guests: Number(e.target.value) || 1 }))}
                    required 
                    className="bg-background"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingRes(null)}>Cancel</Button>
                  <Button type="submit" disabled={updatingRes}>{updatingRes ? "Saving..." : "Save Changes"}</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

      {/* Edit Restaurant Dialog */}
      <Dialog open={!!editingRestaurantId} onOpenChange={(open) => !open && setEditingRestaurantId(null)}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
            <DialogDescription>
              Modify the details for this restaurant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateRestaurant} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editRestaurantForm.name}
                onChange={(e) => setEditRestaurantForm((v) => ({ ...v, name: e.target.value }))}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={editRestaurantForm.location}
                onChange={(e) => setEditRestaurantForm((v) => ({ ...v, location: e.target.value }))}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Cuisine</Label>
              <Input
                value={editRestaurantForm.cuisine}
                onChange={(e) => setEditRestaurantForm((v) => ({ ...v, cuisine: e.target.value }))}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Cost for Two (₹)</Label>
              <Input
                type="number"
                value={editRestaurantForm.costForTwo}
                onChange={(e) => setEditRestaurantForm((v) => ({ ...v, costForTwo: Number(e.target.value) || 0 }))}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Menu Link (Optional)</Label>
              <Input
                value={editRestaurantForm.menuLink}
                onChange={(e) => setEditRestaurantForm((v) => ({ ...v, menuLink: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL (Optional)</Label>
              <Input
                value={editRestaurantForm.imageUrl}
                onChange={(e) => setEditRestaurantForm((v) => ({ ...v, imageUrl: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingRestaurantId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatingRestaurant}>
                {updatingRestaurant ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </motion.main>
    </div>
  );
}
