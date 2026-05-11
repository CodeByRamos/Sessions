"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Compass } from "lucide-react";

type SurfMapSpot = {
  id: string;
  name: string;
  waveType: string;
  latitude?: number;
  longitude?: number;
  sessionsCount: number;
};

type SurfMapProps = {
  token?: string;
  spots: SurfMapSpot[];
};

type MapboxGlobal = {
  accessToken: string;
  Map: new (options: {
    container: HTMLDivElement;
    style: string;
    center: [number, number];
    zoom: number;
  }) => {
    addControl(control: unknown): void;
    remove(): void;
  };
  NavigationControl: new () => unknown;
  Popup: new (options?: { offset?: number }) => {
    setHTML(html: string): unknown;
  };
  Marker: new (options?: { color?: string }) => {
    setLngLat(lngLat: [number, number]): {
      setPopup(popup: unknown): {
        addTo(map: unknown): unknown;
      };
    };
  };
};

declare global {
  interface Window {
    mapboxgl?: MapboxGlobal;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existing) {
      if (window.mapboxgl) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Não foi possível carregar o mapa."));
    document.body.appendChild(script);
  });
}

function ensureMapboxCss() {
  if (document.querySelector('link[data-sessions-mapbox="true"]')) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://api.mapbox.com/mapbox-gl-js/v3.9.2/mapbox-gl.css";
  link.dataset.sessionsMapbox = "true";
  document.head.appendChild(link);
}

function FallbackMap() {
  return (
    <div className="flex h-full min-h-[520px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-tide-300/12 text-tide-300 ring-1 ring-tide-300/25">
        <Compass className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-3xl font-black text-white">Mapa em modo lista</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-sand-100/62">
        Mapa indisponível no momento. Enquanto isso, você pode ver seus picos em lista
        e abrir cada praia para rever suas sessions.
      </p>
    </div>
  );
}

export function SurfMap({ token, spots }: SurfMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const validSpots = useMemo(
    () =>
      spots.filter(
        (spot) =>
          typeof spot.latitude === "number" && typeof spot.longitude === "number",
      ),
    [spots],
  );

  useEffect(() => {
    if (!token || !mapRef.current || !validSpots.length) {
      return;
    }

    const accessToken = token;
    let map: InstanceType<MapboxGlobal["Map"]> | null = null;
    let cancelled = false;

    async function mountMap() {
      try {
        ensureMapboxCss();
        await loadScript("https://api.mapbox.com/mapbox-gl-js/v3.9.2/mapbox-gl.js");

        const mapboxgl = window.mapboxgl;

        if (cancelled || !mapboxgl || !mapRef.current) {
          return;
        }

        mapboxgl.accessToken = accessToken;
        map = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [-46.245, -23.995],
          zoom: 11,
        });
        map.addControl(new mapboxgl.NavigationControl());

        validSpots.forEach((spot) => {
          const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
            `<strong>${spot.name}</strong><br/>${spot.waveType}<br/>${spot.sessionsCount} sessions`,
          );

          new mapboxgl.Marker({ color: "#47e0c6" })
            .setLngLat([spot.longitude as number, spot.latitude as number])
            .setPopup(popup)
            .addTo(map);
        });
      } catch {
        setError(true);
      }
    }

    mountMap();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [token, validSpots]);

  if (!token || !validSpots.length || error) {
    return <FallbackMap />;
  }

  return <div ref={mapRef} className="h-full min-h-[520px] w-full" />;
}
