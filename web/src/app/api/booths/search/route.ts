import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type SearchResult = {
  id: string;
  name: string;
  address: string;
  distance: string;
  wait: string;
  hours: string;
  lat: number;
  lng: number;
  directionsUrl: string;
  placeId?: string;
};

type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

type GooglePlaceResult = {
  place_id?: string;
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) return null;

  const data = await res.json();
  const first = data.results?.[0];
  if (!first?.geometry?.location) return null;

  return {
    lat: first.geometry.location.lat,
    lng: first.geometry.location.lng,
    formattedAddress: first.formatted_address || address,
  };
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d; // Return km directly
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

async function fetchPlacesNearby(lat: number, lng: number): Promise<SearchResult[]> {
  if (!GOOGLE_MAPS_API_KEY) return [];

  const placeKeywords = [
    "government school polling station",
    "election booth",
    "polling station",
    "government school",
    "panchayat office",
    "community hall",
    "municipal office",
  ];

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", "8000");
  url.searchParams.set("keyword", placeKeywords.join(" OR "));
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) return [];

  const data = await res.json();
  const places = Array.isArray(data.results) ? data.results : [];

  return (places as GooglePlaceResult[]).slice(0, 5).map((place, index) => {
    const placeLat = place.geometry.location.lat;
    const placeLng = place.geometry.location.lng;
    const distance = getDistance(lat, lng, placeLat, placeLng);

    return {
      id: String(place.place_id || index),
      name: String(place.name || "Voting Location"),
      address: String(place.vicinity || place.formatted_address || "Address unavailable"),
      distance: `${distance.toFixed(1)} km`,
      wait: index === 0 ? "~10 min" : index === 1 ? "~15 min" : "~20 min",
      hours: "7:00 AM - 6:00 PM",
      lat: placeLat,
      lng: placeLng,
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${String(place.name || "Voting Location")}, ${String(place.vicinity || place.formatted_address || "")}`)}`,
      placeId: typeof place.place_id === "string" ? place.place_id : undefined,
    }
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({
        error: "Google Maps API key not configured",
        source: "google-maps",
      }, { status: 503 });
    }

    const geocoded = await geocodeAddress(query);
    if (!geocoded) {
      return NextResponse.json({
        error: "Unable to geocode the provided address",
        query,
        source: "google-maps",
      }, { status: 422 });
    }

    const results = await fetchPlacesNearby(geocoded.lat, geocoded.lng);

    if (!results.length) {
      return NextResponse.json({
        query,
        source: "google-maps",
        location: geocoded,
        results: [],
        message: "No nearby polling station-like places found for this location.",
      });
    }

    return NextResponse.json({
      query,
      source: "google-maps",
      location: geocoded,
      results,
    });
  } catch (error) {
    console.error("GET /api/booths/search failed:", error);
    return NextResponse.json(
      {
        error: "Booth search service failed",
        query,
        source: "google-maps",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
