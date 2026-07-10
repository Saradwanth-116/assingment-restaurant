import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { RestaurantCard, RestaurantInfo } from "@/components/RestaurantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIME_SLOTS, todayISO } from "@/lib/reservations";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "Restaurants — Tavola" },
      { name: "description", content: "Discover and book the best restaurants." },
    ],
  }),
  component: RestaurantsPage,
});

function RestaurantsPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState(TIME_SLOTS[3]);
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          date,
          time: slot,
          guests: guests.toString(),
        });
        const res = await fetch(`/api/restaurants`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [date, slot, guests]);

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
      r.location.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <AppHeader role={role} email={user?.email ?? undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover Restaurants</h1>
            <p className="text-muted-foreground mt-1">Book a table at the finest spots in town.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, cuisine or location..."
                className="pl-9 bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <div className="relative min-w-[140px]">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="date"
                  min={todayISO()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <div className="relative min-w-[120px]">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select value={slot} onValueChange={setSlot}>
                  <SelectTrigger className="pl-9 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative min-w-[100px]">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  className="pl-9 bg-background/50"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl bg-primary/5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px] bg-primary/5" />
                  <Skeleton className="h-4 w-[200px] bg-primary/5" />
                  <Skeleton className="h-4 w-[150px] bg-primary/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                onClick={(id) => navigate({ to: `/dashboard`, search: { restaurantId: id } })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-muted-foreground">No restaurants found.</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
