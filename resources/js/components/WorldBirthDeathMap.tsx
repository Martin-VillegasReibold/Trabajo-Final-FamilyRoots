import React, { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
// Fetch GeoJSON directly to avoid extra dependencies
const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

type Place = {
  country?: string | null;
  state?: string | null;
  city?: string | null;
} | null | undefined;

export type NodeForMap = {
  key: string | number;
  birth_place?: Place;
  birth_country?: string | null;
  death_place?: Place;
  death_country?: string | null;
  [k: string]: unknown;
};

function normalizeCountry(s?: string | null): string | null {
  if (!s) return null;
  const v = String(s).trim();
  return v ? v : null;
}

// Minimal lat/lon lookup fallback for some common countries; unknowns will be skipped.
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  Argentina: [-64.967, -34.0],
  "United States": [-98.583, 39.833],
  USA: [-98.583, 39.833],
  Canada: [-106.3468, 56.1304],
  Mexico: [-102.5528, 23.6345],
  Spain: [-3.7492, 40.4637],
  "United Kingdom": [-3.4360, 55.3781],
  France: [2.2137, 46.2276],
  Germany: [10.4515, 51.1657],
  Italy: [12.5674, 41.8719],
  Brazil: [-51.9253, -14.2350],
  Chile: [-71.542969, -35.675147],
  Uruguay: [-55.7658, -32.5228],
  Paraguay: [-58.4438, -23.4425],
  Bolivia: [-63.5887, -16.2902],
  Peru: [-75.0152, -9.19],
  Colombia: [-74.2973, 4.5709],
  Venezuela: [-66.5897, 6.4238],
  Portugal: [-8.2245, 39.3999],
  Morocco: [-7.0926, 31.7917],
  China: [104.1954, 35.8617],
  Japan: [138.2529, 36.2048],
  Australia: [133.7751, -25.2744],
  India: [78.9629, 20.5937],
  Russia: [105.3188, 61.5240],
  "South Africa": [22.9375, -30.5595],
};

export default function WorldBirthDeathMap({ nodes, isDark }: { nodes: NodeForMap[]; isDark: boolean }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  type SimpleFeature = { type: 'Feature'; id?: string | number; properties?: Record<string, unknown>; geometry: unknown };
  type SimpleFC = { type: 'FeatureCollection'; features: SimpleFeature[] };
  const [world, setWorld] = useState<SimpleFC | null>(null);
  // Default initial mode set to 'births' per requirement
  const [mode, setMode] = useState<'both' | 'births' | 'deaths'>('births');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
  const res = await fetch(GEOJSON_URL);
  const geojson = (await res.json()) as SimpleFC;
  if (cancelled) return;
  setWorld(geojson);
      } catch (e) {
        console.error('Error loading world map', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const data = useMemo(() => {
    const byCountry = new Map<string, { lat: number; lon: number; births: number; deaths: number }>();
    for (const n of nodes) {
      const birthCountry = normalizeCountry((n.birth_place && typeof n.birth_place === 'object' ? n.birth_place?.country : undefined) || n.birth_country || undefined);
      const deathCountry = normalizeCountry((n.death_place && typeof n.death_place === 'object' ? n.death_place?.country : undefined) || n.death_country || undefined);
      if (birthCountry && COUNTRY_CENTROIDS[birthCountry]) {
        const [lon, lat] = COUNTRY_CENTROIDS[birthCountry];
        const rec = byCountry.get(birthCountry) ?? { lat, lon, births: 0, deaths: 0 };
        rec.births += 1;
        byCountry.set(birthCountry, rec);
      }
      if (deathCountry && COUNTRY_CENTROIDS[deathCountry]) {
        const [lon, lat] = COUNTRY_CENTROIDS[deathCountry];
        const rec = byCountry.get(deathCountry) ?? { lat, lon, births: 0, deaths: 0 };
        rec.deaths += 1;
        byCountry.set(deathCountry, rec);
      }
    }
    return Array.from(byCountry.entries()).map(([country, v]) => ({ country, ...v }));
  }, [nodes]);

  // Build a set of active countries (as lower-case) based on data
  const activeCountries = useMemo(() => {
    const set = new Set<string>();
    for (const d of data) set.add(d.country.toLowerCase());
    return set;
  }, [data]);

  // Map some common GeoJSON ADMIN names to our dataset names for matching
  const normalizeFeatureName = (name: string): string => {
    const n = name.trim();
    switch (n) {
      case 'United States of America':
        return 'United States';
      case 'Russian Federation':
        return 'Russia';
      case 'United Kingdom of Great Britain and Northern Ireland':
        return 'United Kingdom';
      case 'Viet Nam':
        return 'Vietnam';
      case 'Czechia':
        return 'Czech Republic';
      case 'Syrian Arab Republic':
        return 'Syria';
      case 'Iran (Islamic Republic of)':
        return 'Iran';
      case 'Bolivia (Plurinational State of)':
        return 'Bolivia';
      case 'Venezuela (Bolivarian Republic of)':
        return 'Venezuela';
      case 'Tanzania, United Republic of':
        return 'Tanzania';
      default:
        return n;
    }
  };

  // Adjust scale/translate for enlarged viewBox
  const projection = useMemo(() => geoMercator().scale(180).translate([500, 350]), []); // tuned for 1000x600
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const stroke = isDark ? '#334155' : '#cbd5e1';
  const fill = isDark ? '#1f2937' : '#e5e7eb';
  const fillActive = isDark ? '#064e3b' : '#bbf7d0';
  const markerBirth = '#10b981';
  const markerDeath = '#ef4444';

  return (
    <div className="relative w-full h-full">
      {/* Toggle controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md border border-emerald-500 bg-white/80 px-1 py-1 text-xs font-medium backdrop-blur dark:bg-gray-900/70" role="group" aria-label="Modo del mapa">
        <button
          type="button"
          onClick={() => setMode('births')}
          className={`${mode === 'births' ? 'bg-emerald-500 text-white' : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20'} rounded px-2 py-1`}
          aria-pressed={mode === 'births'}
        >
          Nacimientos
        </button>
        <button
          type="button"
          onClick={() => setMode('deaths')}
          className={`${mode === 'deaths' ? 'bg-rose-500 text-white' : 'text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20'} rounded px-2 py-1`}
          aria-pressed={mode === 'deaths'}
        >
          Fallecimientos
        </button>
        <button
          type="button"
          onClick={() => setMode('both')}
          className={`${mode === 'both' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/40'} rounded px-2 py-1`}
          aria-pressed={mode === 'both'}
        >
          Ambos
        </button>
      </div>
      {/* Legend */}
      <div className="absolute top-12 right-2 z-10 rounded-md border bg-white/80 px-2 py-1 text-[11px] backdrop-blur dark:bg-gray-900/70">
        <div className="flex items-center gap-2">
          {(mode === 'both' || mode === 'births') && (
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full" style={{ backgroundColor: markerBirth }}></span> Nacimientos</span>
          )}
          {(mode === 'both' || mode === 'deaths') && (
            <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full" style={{ backgroundColor: markerDeath }}></span> Fallecimientos</span>
          )}
        </div>
      </div>
      <svg ref={svgRef} viewBox="0 0 1000 600" className="w-full h-full select-none" aria-label="Mapa mundial nacimientos y fallecimientos">
        <rect x={0} y={0} width={1000} height={600} fill={isDark ? '#0f172a' : '#ffffff'} />
        {world && world.features && world.features.map((f) => {
          // d3-geo pathGen expects GeoJSON Feature; our type is minimal, cast safely just for rendering
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dAttr = pathGen(f as any) ?? '';
          const props = (f as unknown as { properties?: Record<string, unknown> }).properties || {};
          const adminName = (props['ADMIN'] || props['NAME'] || props['name'] || '').toString();
          const canonical = normalizeFeatureName(adminName).toLowerCase();
          const isActive = activeCountries.has(canonical);
          return (
            <path key={String(f.id ?? Math.random())} d={dAttr} fill={isActive ? fillActive : fill} stroke={stroke} strokeWidth={0.5} />
          );
        })}
        {data.map(d => {
          const birthR = d.births > 0 ? 3 + Math.min(7, d.births) : 0;
          const deathR = d.deaths > 0 ? 3 + Math.min(7, d.deaths) : 0;
          // Positioning: in 'both' mode, slightly offset deaths to avoid overlap; otherwise center both on centroid
          const birthPoint = projection([d.lon, d.lat]) ?? [0, 0];
          const deathPoint = mode === 'both' ? (projection([d.lon + 0.5, d.lat + 0.5]) ?? [0, 0]) : (projection([d.lon, d.lat]) ?? [0, 0]);
          const [xBirth, yBirth] = birthPoint;
          const [xDeath, yDeath] = deathPoint;
          return (
            <g key={d.country}>
              {mode !== 'deaths' && birthR > 0 && (
                <g>
                  <circle cx={xBirth} cy={yBirth} r={birthR} fill={markerBirth} fillOpacity={0.8} />
                  <text x={xBirth + birthR + 2} y={yBirth + 4} className="text-[10px]" fill={isDark ? '#e2e8f0' : '#334155'}>
                    {d.country}: {d.births}
                  </text>
                </g>
              )}
              {mode !== 'births' && deathR > 0 && (
                <g>
                  <circle cx={xDeath} cy={yDeath} r={deathR} fill={markerDeath} fillOpacity={0.8} />
                  <text x={xDeath + deathR + 2} y={yDeath + 4} className="text-[10px]" fill={isDark ? '#e2e8f0' : '#334155'}>
                    {d.country}: {d.deaths}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
