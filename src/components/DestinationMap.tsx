"use client";

import { useEffect, useState } from "react";
import { MapPin, Star, Utensils, Loader2, ExternalLink } from "lucide-react";

type OSMRestaurant = {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    cuisine?: string;
    "addr:street"?: string;
    opening_hours?: string;
    phone?: string;
    website?: string;
  };
};

type Props = {
  name: string;
  lat: number;
  lng: number;
  radiusMeters?: number;
};

export default function DestinationMap({ name, lat, lng, radiusMeters = 1000 }: Props) {
  const [restaurants, setRestaurants] = useState<OSMRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Map iframe URL — OpenStreetMap embed
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.08},${lat - 0.08},${lng + 0.08},${lat + 0.08}&layer=mapnik&marker=${lat},${lng}`;
  const mapFullUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;

  // Fetch nearby restaurants from Overpass API
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(false);
      try {
        // Query: find restaurants within radiusMeters around lat/lng
        const query = `
          [out:json][timeout:10];
          node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
          out 10;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        const results: OSMRestaurant[] = (data.elements || []).filter(
          (el: any) => el.tags?.name
        );
        setRestaurants(results.slice(0, 6));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [lat, lng, radiusMeters]);

  const getCuisine = (cuisine?: string) => {
    if (!cuisine) return "Restaurante";
    return cuisine.split(";")[0].replace(/_/g, " ");
  };

  return (
    <div className="space-y-5">
      {/* MAP */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-gray-800">Ubicación de {name}</span>
          </div>
          <a href={mapFullUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
            Ver completo <ExternalLink size={11} />
          </a>
        </div>
        <div className="h-64 w-full">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            title={`Mapa de ${name}`}
          />
        </div>
      </div>

     
      </div>
   
  );
}
