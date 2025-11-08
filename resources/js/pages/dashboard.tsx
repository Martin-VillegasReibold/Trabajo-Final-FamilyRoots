import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import WorldBirthDeathMap from '@/components/WorldBirthDeathMap';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type TreeLite = { id: number; name: string };

type Place = { country?: string | null } | null | undefined;
type NodeData = {
    key: string | number;
    name?: string;
    gender?: string | null;
    birth_date?: string | null;
    death_date?: string | null;
    birth_place?: Place;
    birth_country?: string | null;
    [k: string]: unknown;
};

export default function Dashboard() {
    const [trees, setTrees] = useState<TreeLite[]>([]);
    const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode via Tailwind 'dark' class and react to changes
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const getDark = () => document.documentElement.classList.contains('dark');
        setIsDark(getDark());
        const observer = new MutationObserver(() => setIsDark(getDark()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const titleColor = isDark ? '#f1f5f9' : '#0f172a';

    // Load user's trees for selector
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/arboles/api/my-trees', {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!res.ok) throw new Error('No se pudo cargar la lista de árboles');
                const data = (await res.json()) as { trees: TreeLite[] };
                if (!cancelled) {
                    setTrees(data.trees ?? []);
                    if ((data.trees?.length ?? 0) > 0) setSelectedTreeId(data.trees[0].id);
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Error desconocido');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Helper: load nodes for current selectedTreeId
    const loadNodes = async (treeId: number) => {
        setLoading(true);
        setError(null);
        try {
            const controller = new AbortController();
            const res = await fetch(`/arboles/api/${treeId}/data`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                signal: controller.signal,
            });
            if (!res.ok) throw new Error('No se pudo cargar los datos del árbol');
            const data = (await res.json()) as { nodes: NodeData[] };
            setNodes(data.nodes ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    // Load nodes when tree changes
    useEffect(() => {
        if (!selectedTreeId) return;
        void loadNodes(selectedTreeId);
    }, [selectedTreeId]);

    // Helpers to compute datasets
    const genderChart = useMemo(() => {
        const counts: Record<string, number> = { Masculino: 0, Femenino: 0, Otro: 0 };
        for (const n of nodes) {
            const gRaw = (n.gender ?? '').toString().trim().toLowerCase();
            if (gRaw === 'male' || gRaw === 'm' || gRaw === 'masculino') {
                counts.Masculino++;
            } else if (gRaw === 'female' || gRaw === 'f' || gRaw === 'femenino') {
                counts.Femenino++;
            } else if (gRaw && gRaw !== 'null' && gRaw !== 'undefined') {
                counts.Otro++;
            }
            // Si no hay género (vacío, null, undefined), no sumamos "Desconocido": lo omitimos
        }
        const labels = ['Masculino', 'Femenino', 'Otro'];
        return {
            labels,
            datasets: [
                {
                    label: 'Distribución por género',
                    data: [counts.Masculino, counts.Femenino, counts.Otro],
                    backgroundColor: ['#60a5fa', '#f472b6', '#fbbf24'],
                    borderWidth: 0,
                },
            ],
        };
    }, [nodes]);

    const lifeStatusChart = useMemo(() => {
        let vivos = 0;
        let fallecidos = 0;
        for (const n of nodes) {
            if (n.death_date && String(n.death_date).trim() !== '') fallecidos++;
            else vivos++;
        }
        return {
            labels: ['Vivos', 'Fallecidos'],
            datasets: [
                {
                    label: 'Estado de vida',
                    data: [vivos, fallecidos],
                    backgroundColor: ['#34d399', '#ef4444'],
                    borderWidth: 0,
                },
            ],
        };
    }, [nodes]);

    const birthsByDecadeChart = useMemo(() => {
        const decadeCounts = new Map<string, number>();
        const getYear = (s?: string | null) => {
            if (!s) return undefined;
            const m = String(s).match(/(\d{4})/);
            if (!m) return undefined;
            const y = Number(m[1]);
            return Number.isFinite(y) ? y : undefined;
        };
        for (const n of nodes) {
            const y = getYear(n.birth_date ?? null);
            if (!y) continue;
            const decade = Math.floor(y / 10) * 10;
            const label = `${decade}s`;
            decadeCounts.set(label, (decadeCounts.get(label) ?? 0) + 1);
        }
        const labels = Array.from(decadeCounts.keys()).sort((a, b) => parseInt(a) - parseInt(b));
        return {
            labels,
            datasets: [
                {
                    label: 'Nacimientos por década',
                    data: labels.map((l) => decadeCounts.get(l) ?? 0),
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                },
            ],
        };
    }, [nodes]);

    const averageAgeByDecadeChart = useMemo(() => {
        type Acc = { sum: number; count: number };
        const acc: Record<string, Acc> = {};
        const getYear = (s?: string | null) => {
            if (!s) return undefined;
            const m = String(s).match(/(\d{4})/);
            if (!m) return undefined;
            const y = Number(m[1]);
            return Number.isFinite(y) ? y : undefined;
        };
        const now = new Date();
        const currentYear = now.getFullYear();

        for (const n of nodes) {
            const by = getYear(n.birth_date ?? null);
            if (!by) continue;
            const decade = Math.floor(by / 10) * 10;
            const dy = getYear(n.death_date ?? null);
            // edad alcanzada: si falleció, death_year - birth_year; si no, año actual - birth_year
            const age = (dy ?? currentYear) - by;
            if (!Number.isFinite(age) || age < 0 || age > 130) continue; // filtros sanidad
            const key = `${decade}s`;
            if (!acc[key]) acc[key] = { sum: 0, count: 0 };
            acc[key].sum += age;
            acc[key].count += 1;
        }

        const labels = Object.keys(acc).sort((a, b) => parseInt(a) - parseInt(b));
        const averages = labels.map((k) => (acc[k].count ? +(acc[k].sum / acc[k].count).toFixed(1) : 0));

        return {
            labels,
            datasets: [
                {
                    label: 'Edad promedio alcanzada',
                    data: averages,
                    backgroundColor: '#a3e635',
                    borderRadius: 6,
                },
            ],
        };
    }, [nodes]);

    const birthsByMonthChart = useMemo(() => {
        const counts: number[] = Array(12).fill(0);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        const getMonthIndex = (s?: string | null): number | undefined => {
            if (!s) return undefined;
            // Try native Date parsing first
            const d = new Date(s);
            if (!Number.isNaN(d.getTime())) return d.getMonth();

            const str = String(s);
            // Formats like YYYY-MM or YYYY-MM-DD
            let m = str.match(/^(\d{4})[-/](\d{1,2})(?:[-/]|$)/);
            if (m) {
                const idx = Number(m[2]) - 1;
                if (idx >= 0 && idx < 12) return idx;
            }
            // Formats like DD-MM-YYYY or D/M/YYYY (assume second part is month)
                m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/]\d{2,4}$/);
            if (m) {
                const idx = Number(m[2]) - 1;
                if (idx >= 0 && idx < 12) return idx;
            }
            return undefined;
        };

        for (const n of nodes) {
            const mi = getMonthIndex(n.birth_date ?? null);
            if (typeof mi === 'number' && mi >= 0 && mi < 12) counts[mi]++;
        }

        return {
            labels: monthNames,
            datasets: [
                {
                    label: 'Nacimientos por mes',
                    data: counts,
                    backgroundColor: '#60a5fa',
                    borderRadius: 6,
                },
            ],
        };
    }, [nodes]);

    const zodiacChart = useMemo(() => {
        // Definición de rangos de signos (mes es 0-index, día inclusive inicio, exclusivo fin)
        const zodiacRanges: { name: string; start: [number, number]; end: [number, number]; color: string }[] = [
            { name: 'Aries', start: [2, 21], end: [3, 20], color: '#f87171' },      // 21 Mar - 19 Abr
            { name: 'Tauro', start: [3, 20], end: [4, 21], color: '#fb923c' },      // 20 Abr - 20 May
            { name: 'Géminis', start: [4, 21], end: [5, 21], color: '#fbbf24' },    // 21 May - 20 Jun
            { name: 'Cáncer', start: [5, 21], end: [6, 23], color: '#34d399' },     // 21 Jun - 22 Jul
            { name: 'Leo', start: [6, 23], end: [7, 23], color: '#60a5fa' },        // 23 Jul - 22 Ago
            { name: 'Virgo', start: [7, 23], end: [8, 23], color: '#a78bfa' },      // 23 Ago - 22 Sep
            { name: 'Libra', start: [8, 23], end: [9, 23], color: '#f472b6' },      // 23 Sep - 22 Oct
            { name: 'Escorpio', start: [9, 23], end: [10, 22], color: '#fb7185' },  // 23 Oct - 21 Nov
            { name: 'Sagitario', start: [10, 22], end: [11, 22], color: '#38bdf8' },// 22 Nov - 21 Dic
            { name: 'Capricornio', start: [11, 22], end: [0, 20], color: '#6366f1' },// 22 Dic - 19 Ene
            { name: 'Acuario', start: [0, 20], end: [1, 19], color: '#0ea5e9' },     // 20 Ene - 18 Feb
            { name: 'Piscis', start: [1, 19], end: [2, 21], color: '#14b8a6' },      // 19 Feb - 20 Mar
        ];

        const counts: Record<string, number> = Object.fromEntries(zodiacRanges.map(z => [z.name, 0]));

        const parseMD = (s?: string | null): [number, number] | undefined => {
            if (!s) return undefined;
            const d = new Date(s);
            if (!Number.isNaN(d.getTime())) return [d.getMonth(), d.getDate()];
            const str = String(s);
            // YYYY-MM-DD
            let m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
            if (m) {
                const mm = Number(m[2]);
                const dd = Number(m[3]);
                if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return [mm - 1, dd];
            }
            // DD-MM-YYYY
            m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/]\d{2,4}$/);
            if (m) {
                const dd = Number(m[1]);
                const mm = Number(m[2]);
                if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return [mm - 1, dd];
            }
            return undefined;
        };

        const inRange = (month: number, day: number, start: [number, number], end: [number, number]) => {
            const [sm, sd] = start;
            const [em, ed] = end;
            if (sm === em) {
                return month === sm && day >= sd && day < ed;
            }
            // Rango que cruza año (ej: Capricornio)
            if (sm > em) {
                return (month === sm && day >= sd) || (month === em && day < ed) || (month > sm || month < em);
            }
            // Rango dentro del mismo año
            if (month === sm && day >= sd) return true;
            if (month === em && day < ed) return true;
            return month > sm && month < em;
        };

        for (const n of nodes) {
            const md = parseMD(n.birth_date ?? null);
            if (!md) continue;
            const [m, d] = md;
            const sign = zodiacRanges.find(z => inRange(m, d, z.start, z.end));
            if (sign) counts[sign.name]++;
        }

        const labels = zodiacRanges.map(z => z.name);
        const data = labels.map(l => counts[l]);
        const colors = zodiacRanges.map(z => z.color);

        return {
            labels,
            datasets: [
                {
                    label: 'Distribución por signo',
                    data,
                    backgroundColor: colors,
                    borderWidth: 0,
                },
            ],
        };
    }, [nodes]);

    const birthCountriesChart = useMemo(() => {
        const counts = new Map<string, number>();
        for (const n of nodes) {
            const country = (n.birth_place && typeof n.birth_place === 'object' ? (n.birth_place as Place)?.country : undefined) || n.birth_country || 'Desconocido';
            const label = country && String(country).trim() !== '' ? String(country) : 'Desconocido';
            counts.set(label, (counts.get(label) ?? 0) + 1);
        }
        // top 8 countries
        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const labels = sorted.map((s) => s[0]);
        const data = sorted.map((s) => s[1]);
        const palette = ['#93c5fd', '#fca5a5', '#fde68a', '#86efac', '#c4b5fd', '#f9a8d4', '#fcd34d', '#a7f3d0'];
        return {
            labels,
            datasets: [
                {
                    label: 'Países de nacimiento (Top 8)',
                    data,
                    backgroundColor: labels.map((_, i) => palette[i % palette.length]),
                    borderWidth: 0,
                },
            ],
        };
    }, [nodes]);

    const diseasesChart = useMemo(() => {
        type TagItem = { tag_value?: string; value?: string; name?: string; label?: string } | string;
        type NodeWithTags = NodeData & { tags?: TagItem[]; node_data?: { tags?: TagItem[] } };
        const counts = new Map<string, number>();
        for (const n of nodes as NodeWithTags[]) {
            const top = Array.isArray(n.tags) ? (n.tags as TagItem[]) : [];
            const embedded = Array.isArray(n.node_data?.tags) ? (n.node_data!.tags as TagItem[]) : [];
            const tagArray: TagItem[] = [...top, ...embedded];
            if (tagArray.length === 0) continue;
            for (const t of tagArray) {
                let value = '';
                if (typeof t === 'string') value = t.trim();
                else if (t && typeof t === 'object') value = String(t.tag_value ?? t.value ?? t.name ?? t.label ?? '').trim();
                if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
            }
        }
        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const labels = sorted.length ? sorted.map(([name]) => name) : ['Sin datos'];
        const data = sorted.length ? sorted.map(([, v]) => v) : [0];
        return {
            labels,
            datasets: [
                {
                    label: 'Familiares por enfermedad (Top 10)',
                    data,
                    backgroundColor: '#f59e0b',
                    borderRadius: 6,
                },
            ],
        };
    }, [nodes]);

    const nationalityChart = useMemo(() => {
        const counts = new Map<string, number>();
        for (const n of nodes) {
            const nat: unknown = (n as unknown as { nationality?: unknown }).nationality;
            let arr: unknown[] = [];
            if (Array.isArray(nat)) {
                arr = nat;
            } else if (nat && typeof nat === 'object') {
                const maybe = (nat as Record<string, unknown>).countries;
                if (Array.isArray(maybe)) arr = maybe;
            }
            const filtered = arr.filter(v => {
                if (v == null) return false;
                if (typeof v === 'string') return v.trim() !== '';
                if (typeof v === 'object') {
                    const o = v as Record<string, unknown>;
                    const name = String((o.label ?? o.name ?? o.country ?? o.value) ?? '').trim();
                    return name !== '';
                }
                return false;
            });
            const num = filtered.length;
            const bucket = num > 4 ? '4+' : String(num);
            counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
        }
        const labels = Array.from(counts.keys()).sort((a, b) => {
            const toNum = (s: string) => (s.endsWith('+') ? parseInt(s) + 0.5 : parseInt(s));
            return toNum(a) - toNum(b);
        });
        const data = labels.map(l => counts.get(l) ?? 0);
        const palette = ['#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fca5a5'];
        return {
            labels,
            datasets: [
                {
                    label: 'Personas por cantidad de nacionalidades',
                    data,
                    backgroundColor: labels.map((_, i) => palette[i % palette.length]),
                    borderWidth: 0,
                },
            ],
        };
    }, [nodes]);

    const totalMiembros = nodes.length;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard"/>
            <main className="flex h-full flex-1 flex-col gap-6 overflow-x-auto bg-slate-50 p-6 dark:bg-gray-900">
                {/* Skip link for keyboard users */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800 focus:z-50"
                >
                    Ir al contenido principal
                </a>
                {/* Selector de árbol */}
                <div className="flex items-center gap-3">
                    <label htmlFor="tree-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Seleccionar árbol
                    </label>
                    <select
                        id="tree-select"
                        className="rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
                        value={selectedTreeId ?? ''}
                        onChange={(e) => setSelectedTreeId(e.target.value ? Number(e.target.value) : null)}
                    >
                        {trees.length === 0 && <option value="">No hay árboles</option>}
                        {trees.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => selectedTreeId && loadNodes(selectedTreeId)}
                        disabled={!selectedTreeId || loading}
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                        aria-label="Actualizar datos de árbol"
                        title="Actualizar"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2"><svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Actualizando…</span>
                        ) : (
                            <span className="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M21 3v9h-9"/></svg>Actualizar</span>
                        )}
                    </button>
                    <div className="ml-auto text-sm text-gray-600 dark:text-gray-300">
                        {loading ? 'Cargando datos…' : error ? (
                            <span className="text-red-500">{error}</span>
                        ) : (
                            <span>Total Familiares: {totalMiembros}</span>
                        )}
                    </div>
                </div>
                
                <div className="grid auto-rows-min gap-6 md:grid-cols-3" id="main-content">
                    <div className="relative h-72 overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Distribución por género">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Doughnut
                                data={genderChart}
                                options={{
                                    maintainAspectRatio: false,
                                    cutout: '60%',
                                    plugins: {
                                        legend: { position: 'right' },
                                        tooltip: {
                                            callbacks: {
                                                label: (ctx) => {
                                                    const raw = ctx.raw as number;
                                                    const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0) || 1;
                                                    const pct = Math.round((raw / total) * 100);
                                                    return `${ctx.label}: ${raw} (${pct}%)`;
                                                },
                                            },
                                        },
                                        title: { display: true, text: 'Distribución de Género', color: titleColor, font: { size: 14, weight: 'bold' } },
                                    },
                                }}
                            />
                        )}
                    </div>
                    <div className="relative h-72 overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Vivos vs Fallecidos">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Doughnut 
                                data={lifeStatusChart} 
                                options={{ 
                                    maintainAspectRatio: false,
                                    cutout: '60%',
                                    plugins: { 
                                        legend: { position: 'right' },
                                        title: { display: true, text: 'Estado de Vida (Vivos vs Fallecidos)', color: titleColor, font: { size: 14, weight: 'bold' } }
                                    } 
                                }} 
                            />
                        )}
                    </div>
                    <div className="relative h-72 overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Personas por cantidad de nacionalidades (dona)">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Doughnut
                                data={nationalityChart}
                                options={{
                                    maintainAspectRatio: false,
                                    cutout: '60%',
                                    plugins: {
                                        legend: { position: 'right' },
                                        title: { display: true, text: 'Nacionalidades por Persona', color: titleColor, font: { size: 14, weight: 'bold' } },
                                        tooltip: {
                                            callbacks: {
                                                label: (ctx) => {
                                                    const raw = ctx.raw as number;
                                                    const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0) || 1;
                                                    const pct = Math.round((raw / total) * 100);
                                                    return `${ctx.label}: ${raw} (${pct}%)`;
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        )}
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Países de nacimiento (Top 8)">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Bar
                                data={birthCountriesChart}
                                options={{
                                    responsive: true,
                                    plugins: { 
                                        legend: { display: false },
                                        title: { display: true, text: 'Top 8 Países de Nacimiento', color: titleColor, font: { size: 14, weight: 'bold' } }
                                    },
                                    scales: { x: { ticks: { color: '#64748b' } }, y: { ticks: { color: '#64748b', precision: 0 }, beginAtZero: true } },
                                }}
                            />
                        )}
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Nacimientos por década">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Bar
                                data={birthsByDecadeChart}
                                options={{
                                    responsive: true,
                                    plugins: { 
                                        legend: { display: false },
                                        title: { display: true, text: 'Nacimientos por Década', color: titleColor, font: { size: 16, weight: 'bold' } }
                                    },
                                    scales: {
                                        x: { ticks: { color: '#64748b' } },
                                        y: { ticks: { color: '#64748b', precision: 0 }, beginAtZero: true },
                                    },
                                }}
                            />
                        )}
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Edad promedio alcanzada por década">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Bar
                                data={averageAgeByDecadeChart}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'Edad Promedio Alcanzada por Década', color: titleColor, font: { size: 14, weight: 'bold' } },
                                        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} años` } }
                                    },
                                    scales: {
                                        x: { ticks: { color: '#64748b' } },
                                        y: { ticks: { color: '#64748b' }, beginAtZero: true }
                                    }
                                }}
                            />
                        )}
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Nacimientos por mes">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Bar
                                data={birthsByMonthChart}
                                options={{
                                    responsive: true,
                                    plugins: { 
                                        legend: { display: false },
                                        title: { display: true, text: 'Nacimientos por Mes', color: titleColor, font: { size: 16, weight: 'bold' } }
                                    },
                                    scales: {
                                        x: { ticks: { color: '#64748b' } },
                                        y: { ticks: { color: '#64748b', precision: 0 }, beginAtZero: true },
                                    },
                                }}
                            />
                        )}
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Signos zodiacales (barras)">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Bar
                                data={zodiacChart}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'Personas por Signo Zodiacal', color: titleColor, font: { size: 14, weight: 'bold' } }
                                    },
                                    scales: {
                                        x: { ticks: { color: '#64748b' } },
                                        y: { ticks: { color: '#64748b', precision: 0 }, beginAtZero: true }
                                    }
                                }}
                            />
                        )}
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Enfermedades más frecuentes (Top 10)">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <Bar
                                data={diseasesChart}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'Enfermedades más Frecuentes', color: titleColor, font: { size: 14, weight: 'bold' } }
                                    },
                                    scales: {
                                        x: { ticks: { color: '#64748b' } },
                                        y: { ticks: { color: '#64748b', precision: 0 }, beginAtZero: true },
                                    },
                                }}
                            />
                        )}
                    </div>
                    <div className="relative col-span-full h-[500px] sm:h-[560px] md:h-[640px] lg:h-[720px] overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-gray-800 p-4" tabIndex={0} role="region" aria-label="Mapa mundial de nacimientos y fallecimientos">
                        {nodes.length === 0 ? (
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                        ) : (
                            <>
                                <div className="absolute top-2 left-2 z-10 text-xs font-semibold px-2 py-1 rounded bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-emerald-500 text-emerald-700 dark:text-emerald-300">Mapa Mundial Nacimientos / Fallecimientos</div>
                                <WorldBirthDeathMap nodes={nodes} isDark={isDark} />
                            </>
                        )}
                    </div>
                 
                </div>
            </main>
        </AppLayout>
    );
}
