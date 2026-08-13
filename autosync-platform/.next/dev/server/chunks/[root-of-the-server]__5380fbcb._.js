module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/autosync-platform/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$autosync$2d$platform$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/autosync-platform/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$autosync$2d$platform$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[project]/autosync-platform/src/app/api/cronogramas/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$autosync$2d$platform$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/autosync-platform/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$autosync$2d$platform$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/autosync-platform/src/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const marca = searchParams.get('marca');
        const modelo = searchParams.get('modelo');
        const km = searchParams.get('km');
        const where = {
            activo: true
        };
        if (marca) {
            const marcaTrim = marca.trim().toLowerCase();
            const todasMarcas = await __TURBOPACK__imported__module__$5b$project$5d2f$autosync$2d$platform$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].cronogramaService.findMany({
                where: {
                    activo: true
                },
                select: {
                    marca: true
                },
                distinct: [
                    'marca'
                ]
            });
            const marcasMatch = todasMarcas.filter((m)=>{
                const mLow = m.marca.toLowerCase();
                return mLow.includes(marcaTrim) || marcaTrim.includes(mLow) || mLow.replace(/[^a-z0-9]/g, '').includes(marcaTrim.replace(/[^a-z0-9]/g, '')) || marcaTrim.replace(/[^a-z0-9]/g, '').includes(mLow.replace(/[^a-z0-9]/g, ''));
            }).map((m)=>m.marca);
            where.OR = marcasMatch.length > 0 ? marcasMatch.map((m)=>({
                    marca: m
                })) : [
                {
                    marca: marca.trim()
                }
            ];
        }
        const cronogramasRaw = await __TURBOPACK__imported__module__$5b$project$5d2f$autosync$2d$platform$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].cronogramaService.findMany({
            where,
            orderBy: [
                {
                    marca: 'asc'
                },
                {
                    modelo: 'asc'
                },
                {
                    kilometraje: 'asc'
                }
            ]
        });
        let cronogramas = cronogramasRaw;
        if (modelo) {
            const modeloTrim = modelo.trim().toLowerCase();
            const matchEspecifico = cronogramasRaw.filter((c)=>{
                const cModelo = c.modelo.toLowerCase();
                return cModelo !== 'genérico' && (cModelo.includes(modeloTrim) || modeloTrim.includes(cModelo));
            });
            if (matchEspecifico.length > 0) {
                const marcasEnEsp = Array.from(new Set(matchEspecifico.map((c)=>c.marca)));
                const genericos = cronogramasRaw.filter((c)=>c.modelo === 'Genérico' && marcasEnEsp.includes(c.marca));
                const kmEnEsp = new Set(matchEspecifico.map((c)=>c.kilometraje));
                const genericosFalt = genericos.filter((c)=>!kmEnEsp.has(c.kilometraje));
                cronogramas = [
                    ...matchEspecifico,
                    ...genericosFalt
                ].sort((a, b)=>{
                    if (a.kilometraje !== b.kilometraje) return a.kilometraje - b.kilometraje;
                    return a.modelo === 'Genérico' ? 1 : -1;
                });
            } else {
                cronogramas = cronogramasRaw.filter((c)=>c.modelo === 'Genérico');
            }
        }
        let sugerido = null;
        let proximo = null;
        if (km) {
            const kmNum = Number(km);
            const pasados = cronogramas.filter((c)=>c.kilometraje <= kmNum);
            sugerido = pasados.length > 0 ? pasados[pasados.length - 1] : null;
            const futuros = cronogramas.filter((c)=>c.kilometraje > kmNum);
            proximo = futuros.length > 0 ? futuros[0] : null;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$autosync$2d$platform$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            cronogramas,
            sugerido,
            proximo,
            total: cronogramas.length
        });
    } catch (error) {
        console.error('Error cronogramas:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$autosync$2d$platform$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Error interno'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5380fbcb._.js.map