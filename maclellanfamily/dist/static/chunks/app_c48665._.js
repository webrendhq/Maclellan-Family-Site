(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/app_c48665._.js", {

"[project]/app/api/firebase/firebase.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "auth": (()=>auth),
    "db": (()=>db)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$2cab5241$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__o__as__getAuth$3e$__ = __turbopack_import__("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/esm2017/index-2cab5241.js [app-client] (ecmascript) <export o as getAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@firebase/firestore/dist/index.esm2017.js [app-client] (ecmascript)");
;
;
;
// Firebase configuration object using environment variables
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyCqGV5J3if7mJoH464xGx6bZ5wgU_wMn3I"),
    authDomain: ("TURBOPACK compile-time value", "maclellen.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "maclellen"),
    storageBucket: ("TURBOPACK compile-time value", "maclellen.appspot.com"),
    messagingSenderId: ("TURBOPACK compile-time value", "254246388059"),
    appId: ("TURBOPACK compile-time value", "1:254246388059:web:ca15c2405a33477665da7e")
};
// Initialize Firebase app
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initializeApp"])(firebaseConfig);
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$2cab5241$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__o__as__getAuth$3e$__["getAuth"])(app);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirestore"])(app);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/yearbooks/[year]/[time]/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>TimePage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/api/firebase/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/smile.js [app-client] (ecmascript) <export default as Smile>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/coffee.js [app-client] (ecmascript) <export default as Coffee>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/camera.js [app-client] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-client] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$2cab5241$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__y__as__onAuthStateChanged$3e$__ = __turbopack_import__("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/esm2017/index-2cab5241.js [app-client] (ecmascript) <export y as onAuthStateChanged>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
;
var _s = __turbopack_refresh__.signature(), _s1 = __turbopack_refresh__.signature();
'use client';
;
;
;
;
;
;
;
const layoutTypes = [
    'col-span-4 row-span-4',
    'col-span-4 row-span-2',
    'col-span-2 row-span-4',
    'col-span-2 row-span-2'
];
const mobileLayoutTypes = [
    'col-span-2 row-span-3',
    'col-span-2 row-span-2',
    'col-span-1 row-span-2',
    'col-span-1 row-span-1'
];
const stickers = [
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
        color: "text-red-500"
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
        color: "text-yellow-500"
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__["Smile"],
        color: "text-yellow-500"
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__["Coffee"],
        color: "text-brown-500"
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"],
        color: "text-blue-500"
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"],
        color: "text-purple-500"
    }
];
const rotations = [
    -3,
    -2,
    -1,
    0,
    1,
    2,
    3
];
const getRandomImageCount = ()=>Math.floor(Math.random() * 4) + 2; // Random number between 2 and 5
// Image Modal Component
const ImageModal = ({ image, onClose })=>{
    if (!image) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative max-w-7xl w-full h-full flex items-center justify-center",
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        size: 24
                    }, void 0, false, {
                        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                        lineNumber: 90,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                    lineNumber: 86,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full h-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: image.url,
                        alt: "Full size view",
                        fill: true,
                        className: "object-contain rounded-lg shadow-2xl",
                        sizes: "(max-width: 768px) 100vw, 1200px",
                        priority: true
                    }, void 0, false, {
                        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                        lineNumber: 93,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                    lineNumber: 92,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
            lineNumber: 82,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
        lineNumber: 78,
        columnNumber: 7
    }, this);
};
_c = ImageModal;
// Blank Page Component
const BlankPage = ({ isRight })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `
        absolute inset-0
        w-full h-full
        bg-[#fff8e7]
        shadow-lg
        ${isRight ? 'origin-left' : 'origin-right'}
      `,
        style: {
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full h-full p-4 md:p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 bottom-2 md:bottom-4 border-4 border-dashed border-[#d4c4a8] opacity-30"
            }, void 0, false, {
                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
            lineNumber: 122,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
_c1 = BlankPage;
// Helper function for optimal layout
const getOptimalLayout = (imageCount, isMobile)=>{
    switch(imageCount){
        case 2:
            return Array(2).fill(isMobile ? mobileLayoutTypes[0] : layoutTypes[1]);
        case 3:
            if (isMobile) {
                return [
                    mobileLayoutTypes[1],
                    mobileLayoutTypes[3],
                    mobileLayoutTypes[3]
                ];
            }
            return [
                layoutTypes[1],
                layoutTypes[3],
                layoutTypes[3]
            ];
        case 4:
            if (isMobile) {
                return [
                    mobileLayoutTypes[1],
                    mobileLayoutTypes[3],
                    mobileLayoutTypes[3],
                    mobileLayoutTypes[1]
                ];
            }
            return Array(4).fill(layoutTypes[3]); // Four equal quarters
        // case 5:
        //   if (isMobile) {
        //     return [
        //       mobileLayoutTypes[1], // Top
        //       mobileLayoutTypes[3], // Middle left
        //       mobileLayoutTypes[3], // Middle right
        //       mobileLayoutTypes[3], // Bottom left
        //       mobileLayoutTypes[3], // Bottom right
        //     ];
        //   }
        //   return [
        //     layoutTypes[1], // Top full width
        //     layoutTypes[3], // Bottom left
        //     layoutTypes[2], // Bottom middle
        //     layoutTypes[3], // Bottom right top
        //     layoutTypes[3], // Bottom right bottom
        //   ];
        default:
            return Array(imageCount).fill(isMobile ? mobileLayoutTypes[3] : layoutTypes[3]);
    }
};
const ScrapbookPage = ({ images, isRight = false, isFlipping = false, zIndex = 1, isMobile = false, layouts, onImageClick })=>{
    _s();
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pageLayouts = layouts || getOptimalLayout(images.length, isMobile);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrapbookPage.useEffect": ()=>{
            setIsLoaded(false);
            const timer = setTimeout({
                "ScrapbookPage.useEffect.timer": ()=>setIsLoaded(true)
            }["ScrapbookPage.useEffect.timer"], 100);
            return ({
                "ScrapbookPage.useEffect": ()=>clearTimeout(timer)
            })["ScrapbookPage.useEffect"];
        }
    }["ScrapbookPage.useEffect"], [
        images
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `
          absolute inset-0
          w-full h-full
          bg-[#fff8e7]
          shadow-lg
          ${isRight ? 'origin-left' : 'origin-right'}
          ${isFlipping ? isRight ? 'page-flip-right' : 'page-flip-left' : ''}
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `,
        style: {
            zIndex,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-full h-full p-4 md:p-8 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 bottom-2 md:bottom-4 border-4 border-dashed border-[#d4c4a8] opacity-30"
                    }, void 0, false, {
                        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                        lineNumber: 215,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `grid ${isMobile ? 'grid-cols-2 grid-rows-3' : 'grid-cols-4 grid-rows-4'} gap-2 md:gap-4 h-full`,
                            children: images.map((image, index)=>{
                                const layout = pageLayouts[index];
                                const rotation = rotations[Math.floor(Math.random() * rotations.length)];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                      relative
                      ${layout}
                      group
                      bg-white
                      p-2 md:p-3
                      shadow-md
                      hover:shadow-xl
                      transition-all
                      duration-300
                      transform-gpu
                      cursor-pointer
                    `,
                                    style: {
                                        transform: `rotate(${rotation}deg)`
                                    },
                                    onClick: ()=>onImageClick(image, index),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-full h-full",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: image.url,
                                                alt: `Memory ${index + 1}`,
                                                fill: true,
                                                className: "object-cover",
                                                sizes: "(max-width: 768px) 33vw, 25vw"
                                            }, void 0, false, {
                                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                lineNumber: 245,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                            lineNumber: 244,
                                            columnNumber: 21
                                        }, this),
                                        Math.random() > 0.5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute",
                                            style: {
                                                top: `${Math.random() * 100}%`,
                                                left: `${Math.random() * 100}%`,
                                                transform: `rotate(${Math.random() * 360}deg)`
                                            },
                                            children: (()=>{
                                                const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
                                                const StickerIcon = randomSticker.icon;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StickerIcon, {
                                                    className: `${randomSticker.color} fill-current`,
                                                    size: isMobile ? 16 : 24
                                                }, void 0, false, {
                                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                    lineNumber: 265,
                                                    columnNumber: 34
                                                }, this);
                                            })()
                                        }, void 0, false, {
                                            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                            lineNumber: 254,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute -top-2 -left-2 w-4 md:w-8 h-4 md:h-8 bg-[#ffffffaa] rotate-45 transform origin-bottom-right"
                                        }, void 0, false, {
                                            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                            lineNumber: 269,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute -top-2 -right-2 w-4 md:w-8 h-4 md:h-8 bg-[#ffffffaa] -rotate-45 transform origin-bottom-left"
                                        }, void 0, false, {
                                            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                            lineNumber: 270,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, image.key, true, {
                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                    lineNumber: 224,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                            lineNumber: 218,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                        lineNumber: 217,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                lineNumber: 214,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 w-full h-full bg-[#fff8e7]",
                style: {
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                }
            }, void 0, false, {
                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                lineNumber: 278,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
        lineNumber: 197,
        columnNumber: 7
    }, this);
};
_s(ScrapbookPage, "e/1lVN3R6kIvuSIAmUIHNmZXQsc=");
_c2 = ScrapbookPage;
function TimePage() {
    _s1();
    const [images, setImages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isFlipping, setIsFlipping] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [flipDirection, setFlipDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pageLayouts, setPageLayouts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [selectedImage, setSelectedImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const { year, time } = params;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimePage.useEffect": ()=>{
            const checkMobile = {
                "TimePage.useEffect.checkMobile": ()=>{
                    setIsMobile(window.innerWidth < 768 || window.innerHeight < 600);
                }
            }["TimePage.useEffect.checkMobile"];
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return ({
                "TimePage.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["TimePage.useEffect"];
        }
    }["TimePage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimePage.useEffect": ()=>{
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2d$2cab5241$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__y__as__onAuthStateChanged$3e$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], {
                "TimePage.useEffect.unsubscribe": async (user)=>{
                    if (!user) {
                        setLoading(false);
                        return;
                    }
                    try {
                        const token = await user.getIdToken();
                        const response = await fetch(`/api/s3/${year}/${time}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        if (!response.ok) {
                            throw new Error('Failed to fetch images');
                        }
                        const data = await response.json();
                        setImages(data.images);
                    } catch (error) {
                        console.error('Error fetching images:', error);
                    } finally{
                        setLoading(false);
                    }
                }
            }["TimePage.useEffect.unsubscribe"]);
            return ({
                "TimePage.useEffect": ()=>unsubscribe()
            })["TimePage.useEffect"];
        }
    }["TimePage.useEffect"], [
        year,
        time
    ]);
    const getOrCreatePageLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimePage.useCallback[getOrCreatePageLayout]": (pageIndex, availableImages)=>{
            if (pageLayouts[pageIndex]) {
                return pageLayouts[pageIndex];
            }
            const imageCount = Math.min(getRandomImageCount(), availableImages.length);
            const layouts = getOptimalLayout(imageCount, isMobile);
            const newLayout = {
                imageCount,
                layouts
            };
            setPageLayouts({
                "TimePage.useCallback[getOrCreatePageLayout]": (prev)=>({
                        ...prev,
                        [pageIndex]: newLayout
                    })
            }["TimePage.useCallback[getOrCreatePageLayout]"]);
            return newLayout;
        }
    }["TimePage.useCallback[getOrCreatePageLayout]"], [
        isMobile,
        pageLayouts
    ]);
    const getCurrentPageImages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimePage.useCallback[getCurrentPageImages]": (pageIndex)=>{
            let startIndex = 0;
            for(let i = 0; i < pageIndex; i++){
                if (pageLayouts[i]) {
                    startIndex += pageLayouts[i].imageCount;
                }
            }
            const layout = getOrCreatePageLayout(pageIndex, images.slice(startIndex));
            return images.slice(startIndex, startIndex + layout.imageCount);
        }
    }["TimePage.useCallback[getCurrentPageImages]"], [
        images,
        pageLayouts,
        getOrCreatePageLayout
    ]);
    const calculateTotalPages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimePage.useCallback[calculateTotalPages]": ()=>{
            let totalImages = 0;
            let pageCount = 0;
            while(totalImages < images.length){
                const currentPageLayout = pageLayouts[pageCount] || {
                    imageCount: Math.min(getRandomImageCount(), images.length - totalImages)
                };
                totalImages += currentPageLayout.imageCount;
                pageCount++;
            }
            return Math.ceil(pageCount / (isMobile ? 1 : 2));
        }
    }["TimePage.useCallback[calculateTotalPages]"], [
        images.length,
        isMobile,
        pageLayouts
    ]);
    const handleImageClick = (image)=>{
        setSelectedImage(image);
    };
    const handleCloseModal = ()=>{
        setSelectedImage(null);
    };
    const handlePageTurn = (direction)=>{
        if (isFlipping) return;
        setFlipDirection(direction);
        setIsFlipping(true);
        setTimeout(()=>{
            if (direction === 'next') {
                setCurrentPage((prev)=>Math.min(totalPages - (isMobile ? 1 : 2), prev + (isMobile ? 1 : 2)));
            } else {
                setCurrentPage((prev)=>Math.max(0, prev - (isMobile ? 1 : 2)));
            }
            setIsFlipping(false);
            setFlipDirection(null);
        }, 800); // Matches animation duration
    };
    const totalPages = calculateTotalPages();
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-screen",
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
            lineNumber: 409,
            columnNumber: 14
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-3c80a10899333aa0" + " " + "min-h-screen bg-[#8b7355] p-4 md:p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3c80a10899333aa0" + " " + "max-w-[1800px] mx-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3c80a10899333aa0" + " " + `relative ${isMobile ? 'aspect-[1/1.4]' : 'aspect-[2/1.4]'} bg-[#654321] rounded-lg shadow-2xl p-4 md:p-8 perspective-[2000px]`,
                        children: [
                            !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3c80a10899333aa0" + " " + "absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-[#463025] shadow-inner"
                            }, void 0, false, {
                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                lineNumber: 417,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3c80a10899333aa0" + " " + "relative h-full overflow-hidden book-pages",
                                children: [
                                    !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-3c80a10899333aa0" + " " + "absolute left-0 w-1/2 h-full",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlankPage, {}, void 0, false, {
                                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                    lineNumber: 424,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                lineNumber: 423,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-3c80a10899333aa0" + " " + "absolute right-0 w-1/2 h-full",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BlankPage, {
                                                    isRight: true
                                                }, void 0, false, {
                                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                    lineNumber: 427,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                lineNumber: 426,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3c80a10899333aa0" + " " + "absolute inset-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrapbookPage, {
                                            images: getCurrentPageImages(currentPage),
                                            isFlipping: isFlipping,
                                            zIndex: 2,
                                            isMobile: true,
                                            layouts: pageLayouts[currentPage]?.layouts,
                                            onImageClick: handleImageClick
                                        }, void 0, false, {
                                            fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                            lineNumber: 434,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                        lineNumber: 433,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-3c80a10899333aa0" + " " + "absolute left-0 w-1/2 h-full",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrapbookPage, {
                                                    images: getCurrentPageImages(currentPage),
                                                    isFlipping: isFlipping && flipDirection === 'prev',
                                                    zIndex: flipDirection === 'prev' ? 3 : 2,
                                                    layouts: pageLayouts[currentPage]?.layouts,
                                                    onImageClick: handleImageClick
                                                }, void 0, false, {
                                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                    lineNumber: 446,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                lineNumber: 445,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-3c80a10899333aa0" + " " + "absolute right-0 w-1/2 h-full",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrapbookPage, {
                                                    images: getCurrentPageImages(currentPage + 1),
                                                    isRight: true,
                                                    isFlipping: isFlipping && flipDirection === 'next',
                                                    zIndex: flipDirection === 'next' ? 3 : 2,
                                                    layouts: pageLayouts[currentPage + 1]?.layouts,
                                                    onImageClick: handleImageClick
                                                }, void 0, false, {
                                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                    lineNumber: 455,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                                lineNumber: 454,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                lineNumber: 420,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                        lineNumber: 415,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3c80a10899333aa0" + " " + "flex justify-center mt-4 md:mt-8 space-x-4 md:space-x-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handlePageTurn('prev'),
                                disabled: currentPage === 0 || isFlipping,
                                className: "jsx-3c80a10899333aa0" + " " + "px-4 md:px-6 py-2 md:py-3 bg-[#463025] text-white rounded-lg disabled:opacity-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: isMobile ? 20 : 24
                                }, void 0, false, {
                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                    lineNumber: 475,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                lineNumber: 470,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handlePageTurn('next'),
                                disabled: currentPage >= totalPages - (isMobile ? 1 : 2) || isFlipping,
                                className: "jsx-3c80a10899333aa0" + " " + "px-4 md:px-6 py-2 md:py-3 bg-[#463025] text-white rounded-lg disabled:opacity-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    size: isMobile ? 20 : 24
                                }, void 0, false, {
                                    fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                    lineNumber: 482,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                                lineNumber: 477,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                        lineNumber: 469,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                lineNumber: 414,
                columnNumber: 9
            }, this),
            selectedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ImageModal, {
                image: selectedImage,
                onClose: handleCloseModal
            }, void 0, false, {
                fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
                lineNumber: 488,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "3c80a10899333aa0",
                children: ".page-flip-right{transform-origin:0;perspective:2000px;animation:.8s ease-in-out flipRight}.page-flip-left{transform-origin:100%;perspective:2000px;animation:.8s ease-in-out flipLeft}@keyframes flipRight{0%{z-index:3;transform:rotateY(0)}to{z-index:3;transform:rotateY(-180deg)}}@keyframes flipLeft{0%{z-index:3;transform:rotateY(0)}to{z-index:3;transform:rotateY(180deg)}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/yearbooks/[year]/[time]/page.tsx",
        lineNumber: 413,
        columnNumber: 7
    }, this);
}
_s1(TimePage, "7YKiMxFKatqHbkXFRDdQ4kU1dDA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c3 = TimePage;
var _c, _c1, _c2, _c3;
__turbopack_refresh__.register(_c, "ImageModal");
__turbopack_refresh__.register(_c1, "BlankPage");
__turbopack_refresh__.register(_c2, "ScrapbookPage");
__turbopack_refresh__.register(_c3, "TimePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/yearbooks/[year]/[time]/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: require } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=app_c48665._.js.map