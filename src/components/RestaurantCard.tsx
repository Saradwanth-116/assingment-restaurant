import { MapPin, Star, Image as ImageIcon, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export type RestaurantInfo = {
  _id: string;
  name: string;
  location: { address: string; googleMapsLink?: string };
  images: string[];
  cuisine: string;
  costForTwo: number;
  rating: number;
  reviewsCount: number;
  isTrending: boolean;
  isTopRated: boolean;
  isPremium: boolean;
};

export function RestaurantCard({
  restaurant,
  onClick,
}: {
  restaurant: RestaurantInfo;
  onClick: (id: string) => void;
}) {
  const imageUrl = restaurant.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 group"
      onClick={() => onClick(restaurant._id)}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {restaurant.isTrending && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md gap-1">
              <Flame className="w-3 h-3" /> Trending
            </Badge>
          )}
          {restaurant.isTopRated && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-md gap-1">
              <Star className="w-3 h-3 fill-current" /> Top Rated
            </Badge>
          )}
        </div>
        
        {/* Top Right Icon */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm p-1.5 rounded text-white shadow-sm">
          <ImageIcon className="w-4 h-4" />
        </div>

        {/* Premium Badge */}
        {restaurant.isPremium && (
          <div className="absolute top-12 left-3">
            <Badge className="bg-amber-200/90 text-amber-900 border-none shadow-sm gap-1 hover:bg-amber-300/90">
              <Star className="w-3 h-3 fill-current" /> Premium
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1">{restaurant.name}</h3>
          <div className="flex items-center gap-1 text-sm bg-green-700 text-white px-1.5 py-0.5 rounded shadow-sm font-medium">
            {restaurant.rating.toFixed(1)} <Star className="w-3 h-3 fill-current" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 font-medium">({restaurant.reviewsCount} reviews)</p>

        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 mb-3 hover:bg-orange-100 transition-colors">
          Member Discount
        </Badge>
        
        <p className="text-sm text-muted-foreground mb-1 font-medium">{restaurant.cuisine}</p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-2 gap-1.5 line-clamp-1">
          <MapPin className="w-4 h-4 shrink-0 text-primary" />
          {restaurant.location.address}
        </div>
        
        <p className="text-sm font-semibold mb-4 text-foreground">₹{restaurant.costForTwo} for 2</p>
        
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200">
            Reservation Guarantee
          </Badge>
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors border border-orange-200">
            Popular
          </Badge>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <Link to="/dashboard" search={{ restaurantId: restaurant._id }} className="w-full">
            <Button className="w-full shadow-sm" variant="default">
              Book a Table
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
