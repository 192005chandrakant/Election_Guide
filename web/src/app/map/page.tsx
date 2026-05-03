"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Navigation, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { TrustStrip } from "@/components/civic-ui";
import { useAuth } from "@/lib/auth-context";

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
  disableDefaultUI: true,
};

type BoothResult = {
  id: string;
  name: string;
  address: string;
  distance: string;
  wait: string;
  hours: string;
  lat: number;
  lng: number;
  directionsUrl: string;
};

type SearchLocation = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

export default function MapPage() {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [results, setResults] = useState<BoothResult[]>([]);
  const [searchSource, setSearchSource] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const hasResults = results.length > 0;

  // Load user location from profile on mount
  useEffect(() => {
    let cancelled = false;
    const loadUserLocation = async () => {
      if (!user?.uid) {
        setIsLoadingLocation(false);
        return;
      }
      try {
        const response = await fetch(`/api/user?userId=${encodeURIComponent(user.uid)}`);
        if (!response.ok || cancelled) return;
        
        const profile = await response.json();
        if (!cancelled && typeof profile.location === "string" && profile.location.trim()) {
          setAddress(profile.location);
        }
      } catch {
        // Continue with empty search if profile load fails
      } finally {
        if (!cancelled) {
          setIsLoadingLocation(false);
        }
      }
    };

    loadUserLocation();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const mapsApiKeyRaw = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const mapsApiKey =
    mapsApiKeyRaw && !/YOUR_|PLACEHOLDER|GOOGLE_MAPS_API_KEY/i.test(mapsApiKeyRaw)
      ? mapsApiKeyRaw
      : "";
  if (!mapsApiKey) {
    console.warn(
      "Google Maps API key is missing or still a placeholder. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local (see FIREBASE_SETUP.md)."
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
    libraries: ["places"] // include places in case the app uses Places services
  });

  if (loadError) {
    console.error("Google Maps loadError:", loadError);
  }

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    if (searchLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      results.forEach(({ lat, lng }) => {
        bounds.extend({ lat, lng });
      });
      if (searchLocation) {
        bounds.extend({ lat: searchLocation.lat, lng: searchLocation.lng });
      }
      map.fitBounds(bounds);
    }
  }, [searchLocation, results])

  const onUnmount = useCallback(function callback() {
    // Google Maps cleanup is handled by the component.
  }, [])

  const center = useMemo(() => {
    if (searchLocation) {
      return { lat: searchLocation.lat, lng: searchLocation.lng };
    }
    return { lat: 19.0760, lng: 72.8777 }; // Default to Mumbai
  }, [searchLocation]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setIsSearching(true);
    setResults([]);
    setSearchSource(null);
    setSearchLocation(null);
    setSearchedQuery(address.trim());

    try {
      const res = await fetch(
        `/api/booths/search?query=${encodeURIComponent(address.trim())}`
      );
      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
      setSearchSource(typeof data.source === "string" ? data.source : null);
      if (
        data.location &&
        typeof data.location.lat === "number" &&
        typeof data.location.lng === "number"
      ) {
        setSearchLocation({
          lat: data.location.lat,
          lng: data.location.lng,
          formattedAddress:
            typeof data.location.formattedAddress === "string"
              ? data.location.formattedAddress
              : address.trim(),
        });
      }
    } catch (error) {
      console.error("Booth search failed", error);
      setResults([]);
      setSearchSource("fallback");
      setSearchLocation(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 civic-field" />
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl border border-accent/20 bg-accent/10 hover:bg-accent/15 hover:border-accent/30"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
              Polling Station Finder
            </h1>
            <p className="text-muted-foreground mt-0.5">
              Locate your nearest voting station instantly.
            </p>
          </div>
        </motion.div>

        <TrustStrip
          source={searchSource === "google-maps" ? "Live Google Maps polling station search" : searchSource === "fallback" ? "Fallback local suggestions shown when live data is unavailable" : "Search results will label live or fallback source"}
          updated={searchLocation?.formattedAddress || "Enter your registered address or Pincode"}
        />

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="gradient-card-accent rounded-2xl border-0 overflow-hidden shadow-2xl shadow-accent/20">
            <CardHeader className="p-4">
              <form onSubmit={handleSearch} className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your registered address or pincode..."
                      className="h-12 pl-10 bg-accent/5 border-accent/20 focus:border-accent/40 focus:ring-accent/20 rounded-xl text-base"
                      disabled={isLoadingLocation}
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isSearching || !address.trim() || isLoadingLocation}
                      className="h-12 px-6 rounded-xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {isSearching ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Searching
                        </span>
                      ) : (
                        "Find Booths"
                      )}
                    </Button>
                  </motion.div>
                </div>
                {!isLoadingLocation && address.trim() && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-accent" />
                    Searching for: <span className="font-medium text-foreground">{address}</span>
                  </motion.div>
                )}
              </form>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map Area */}
          <Card className="lg:col-span-3 border-white/6 bg-white/2 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-0 relative h-[50vh] lg:h-[60vh]">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={10}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={mapOptions}
                >
                  {searchLocation && (
                    <Marker position={{ lat: searchLocation.lat, lng: searchLocation.lng }} />
                  )}
                  {results.map((result, index) => (
                    <Marker
                      key={result.id}
                      position={{ lat: result.lat, lng: result.lng }}
                      label={(index + 1).toString()}
                    />
                  ))}
                </GoogleMap>
              ) : (
                loadError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div>
                      <p className="text-base font-semibold">Failed to load Google Maps</p>
                      <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto mt-2">
                        There was an error loading the Google Maps script: {String(loadError)}. Check
                        your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and browser console for details.
                      </p>
                    </div>
                  </div>
                ) : !mapsApiKey ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div>
                      <p className="text-base font-semibold">Map is unavailable</p>
                      <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto mt-2">
                        The Google Maps API key is not configured. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your
                        `.env.local` (see FIREBASE_SETUP.md) and restart the dev server.
                      </p>
                    </div>
                  </div>
                ) : (
                  <></>
                )
              )}

              {/* Empty State */}
              {!hasResults && !isSearching && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="h-20 w-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-4">
                    <MapPin className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                    <p className="text-muted-foreground font-medium mb-1">
                    No location searched yet
                  </p>
                  <p className="text-sm text-muted-foreground/60 max-w-xs">
                    Enter your address above to find nearby polling stations
                    displayed on the map.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                    <p className="text-sm text-muted-foreground">
                      Searching nearby polling stations...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {hasResults
                ? `${results.length} Nearby Locations`
                : searchedQuery
                  ? "No matches found"
                  : "Results"}
            </h3>
            {searchSource && (
              <p className="px-1 text-xs text-muted-foreground">
                Source: {searchSource === "google-maps" ? "Live Google Maps search" : "Fallback local suggestions"}
              </p>
            )}

            <AnimatePresence>
              {hasResults ? (
                results.map((booth, i) => (
                  <motion.div
                    key={booth.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <Card
                      className={`backdrop-blur-xl transition-all cursor-pointer ${
                        i === 0
                          ? "bg-linear-to-r from-primary/12 to-teal-600/8 border-primary/40 shadow-lg"
                          : "border-teal-500/20 bg-linear-to-r from-teal-600/6 to-cyan-600/4"
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-base">
                            {i === 0 && (
                              <Badge className="mr-2 text-[10px] bg-primary/20 text-primary border-primary/30">
                                🎯 Nearest
                              </Badge>
                            )}
                            {booth.name}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {booth.address}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge
                            variant="outline"
                            className="border-white/10 text-xs"
                          >
                            <MapPin className="mr-1 h-3 w-3" />
                            {booth.distance}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-white/10 text-xs"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Wait: {booth.wait}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-xs">
                            {booth.hours}
                          </Badge>
                        </div>
                        <a href={booth.directionsUrl} target="_blank" rel="noreferrer">
                          <Button
                            className="w-full gap-2 rounded-xl"
                            variant={i === 0 ? "default" : "secondary"}
                          >
                            <Navigation className="h-4 w-4" /> Get Directions
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground italic">
                  {isSearching
                    ? "Searching..."
                    : searchedQuery
                      ? "No live results were found. Try a fuller address or pincode."
                        : "Search for an address to see nearby polling stations."}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
