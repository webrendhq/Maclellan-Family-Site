module.exports = {

"[project]/.next-internal/server/app/api/s3/[year]/[time]/route/actions.js [app-rsc] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
}}),
"[project]/app/api/s3/[year]/[time]/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, a: __turbopack_async_module__, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_esm__({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__ = __turbopack_import__("[externals]/ [external] (@aws-sdk/client-s3, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$s3$2d$request$2d$presigner$2f$dist$2d$es$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/@aws-sdk/s3-request-presigner/dist-es/index.js [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$29$__ = __turbopack_import__("[externals]/ [external] (firebase-admin/auth, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__ = __turbopack_import__("[externals]/ [external] (firebase-admin/firestore, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__ = __turbopack_import__("[externals]/ [external] (firebase-admin/app, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$s3$2d$request$2d$presigner$2f$dist$2d$es$2f$getSignedUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@aws-sdk/s3-request-presigner/dist-es/getSignedUrl.js [app-route] (ecmascript)");
;
;
;
;
;
;
// Initialize Firebase Admin SDK
if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["getApps"])().length) {
    try {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["cert"])({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        throw error;
    }
}
// Initialize S3 Client
const s3Client = new __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["S3Client"]({
    region: process.env.AWS_S3_REGION || 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
async function GET(request, props) {
    try {
        const { year, time } = props.params;
        // Check authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$29$__["getAuth"])().verifyIdToken(token);
        const userId = decodedToken.uid;
        // Fetch user document from Firestore
        const db = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["getFirestore"])();
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        const folderPath = userDoc.data()?.folderPath || '';
        // Define S3 prefix for the time period
        const timePrefix = `${process.env.AWS_BASE_FOLDER}${folderPath}/${year}/${time}/`;
        console.log('Time-specific S3 prefix:', timePrefix);
        // Rest of your code remains the same...
        const command = new __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["ListObjectsV2Command"]({
            Bucket: process.env.AWS_S3_BUCKET,
            Prefix: timePrefix
        });
        const response = await s3Client.send(command);
        const images = await Promise.all((response.Contents || []).filter((item)=>item.Key?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)).map(async (item)=>{
            const getObjectCommand = new __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["GetObjectCommand"]({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: item.Key
            });
            const signedUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$s3$2d$request$2d$presigner$2f$dist$2d$es$2f$getSignedUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSignedUrl"])(s3Client, getObjectCommand, {
                expiresIn: 3600
            });
            return {
                key: item.Key,
                url: signedUrl,
                lastModified: item.LastModified
            };
        }));
        const sortedImages = images.sort((a, b)=>(b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            images: sortedImages,
            prefix: timePrefix
        });
    } catch (error) {
        console.error('Detailed error:', error);
        if (error instanceof Error) {
            console.error({
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/node_modules/next/dist/esm/build/templates/app-route.js { INNER_APP_ROUTE => \"[project]/app/api/s3/[year]/[time]/route.ts [app-route] (ecmascript)\" } [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, a: __turbopack_async_module__, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_esm__({
    "patchFetch": (()=>patchFetch),
    "routeModule": (()=>routeModule),
    "serverHooks": (()=>serverHooks),
    "workAsyncStorage": (()=>workAsyncStorage),
    "workUnitAsyncStorage": (()=>workUnitAsyncStorage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$modules$2f$app$2d$route$2f$module$2e$compiled$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/server/route-modules/app-route/module.compiled.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$kind$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/server/route-kind.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$lib$2f$patch$2d$fetch$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/server/lib/patch-fetch.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$s3$2f5b$year$5d2f5b$time$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/api/s3/[year]/[time]/route.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$s3$2f5b$year$5d2f5b$time$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
([__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$s3$2f5b$year$5d2f5b$time$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__);
;
;
;
;
// We inject the nextConfigOutput here so that we can use them in the route
// module.
const nextConfigOutput = "standalone";
const routeModule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$modules$2f$app$2d$route$2f$module$2e$compiled$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppRouteRouteModule"]({
    definition: {
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$kind$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RouteKind"].APP_ROUTE,
        page: "/api/s3/[year]/[time]/route",
        pathname: "/api/s3/[year]/[time]",
        filename: "route",
        bundlePath: ""
    },
    resolvedPagePath: "[project]/app/api/s3/[year]/[time]/route.ts",
    nextConfigOutput,
    userland: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$s3$2f5b$year$5d2f5b$time$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
});
// Pull out the exports that we need to expose from the module. This should
// be eliminated when we've moved the other routes to the new format. These
// are used to hook into the route.
const { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;
function patchFetch() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$lib$2f$patch$2d$fetch$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["patchFetch"])({
        workAsyncStorage,
        workUnitAsyncStorage
    });
}
;
 //# sourceMappingURL=app-route.js.map
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),

};

//# sourceMappingURL=_9b97a4._.js.map