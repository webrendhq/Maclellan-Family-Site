(()=>{var e={};e.id=988,e.ids=[988],e.modules={1043:e=>{"use strict";e.exports=require("@aws-sdk/client-s3")},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},9428:e=>{"use strict";e.exports=require("buffer")},5511:e=>{"use strict";e.exports=require("crypto")},9021:e=>{"use strict";e.exports=require("fs")},1630:e=>{"use strict";e.exports=require("http")},3496:e=>{"use strict";e.exports=require("http2")},5591:e=>{"use strict";e.exports=require("https")},1820:e=>{"use strict";e.exports=require("os")},3873:e=>{"use strict";e.exports=require("path")},7910:e=>{"use strict";e.exports=require("stream")},9801:e=>{"use strict";e.exports=import("firebase-admin/app")},4276:e=>{"use strict";e.exports=import("firebase-admin/auth")},7879:e=>{"use strict";e.exports=import("firebase-admin/firestore")},9113:(e,r,t)=>{"use strict";t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{patchFetch:()=>p,routeModule:()=>u,serverHooks:()=>m,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>d});var i=t(2706),a=t(8203),o=t(5994),n=t(7618),c=e([n]);n=(c.then?(await c)():c)[0];let u=new i.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/s3/[year]/[time]/route",pathname:"/api/s3/[year]/[time]",filename:"route",bundlePath:"app/api/s3/[year]/[time]/route"},resolvedPagePath:"C:\\Users\\kevin\\OneDrive\\Documents\\GitHub\\MaclellanFamily.com2\\maclellanfamily\\app\\api\\s3\\[year]\\[time]\\route.ts",nextConfigOutput:"standalone",userland:n}),{workAsyncStorage:l,workUnitAsyncStorage:d,serverHooks:m}=u;function p(){return(0,o.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:d})}s()}catch(e){s(e)}})},6487:()=>{},8335:()=>{},7618:(e,r,t)=>{"use strict";t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{GET:()=>l});var i=t(9187),a=t(1043),o=t(9483),n=t(4276),c=t(7879),p=t(9801),u=e([n,c,p]);if([n,c,p]=u.then?(await u)():u,!(0,p.getApps)().length)try{(0,p.initializeApp)({credential:(0,p.cert)({projectId:process.env.FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_ADMIN_CLIENT_EMAIL,privateKey:process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g,"\n")})})}catch(e){throw console.error("Firebase Admin initialization error:",e),e}let d=new a.S3Client({region:process.env.AWS_S3_REGION||"us-east-2",credentials:{accessKeyId:process.env.AWS_ACCESS_KEY_ID||"",secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY||""}});async function l(e,r){try{let{year:t,time:s}=r.params,p=e.headers.get("authorization");if(!p?.startsWith("Bearer "))return i.NextResponse.json({error:"Unauthorized"},{status:401});let u=p.split("Bearer ")[1],l=(await (0,n.getAuth)().verifyIdToken(u)).uid,m=(0,c.getFirestore)(),x=await m.collection("users").doc(l).get();if(!x.exists)return i.NextResponse.json({error:"User not found"},{status:404});let f=x.data()?.folderPath||"",y=`${process.env.AWS_BASE_FOLDER}${f}/${t}/${s}/`;console.log("Time-specific S3 prefix:",y);let E=new a.ListObjectsV2Command({Bucket:process.env.AWS_S3_BUCKET,Prefix:y}),g=await d.send(E),h=(await Promise.all((g.Contents||[]).filter(e=>e.Key?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)).map(async e=>{let r=new a.GetObjectCommand({Bucket:process.env.AWS_S3_BUCKET,Key:e.Key}),t=await (0,o.A)(d,r,{expiresIn:3600});return{key:e.Key,url:t,lastModified:e.LastModified}}))).sort((e,r)=>(r.lastModified?.getTime()||0)-(e.lastModified?.getTime()||0));return i.NextResponse.json({images:h,prefix:y})}catch(e){return console.error("Detailed error:",e),e instanceof Error&&console.error({name:e.name,message:e.message,stack:e.stack,cause:e.cause}),i.NextResponse.json({error:"Internal Server Error",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}s()}catch(e){s(e)}})}};var r=require("../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[989,452,483],()=>t(9113));module.exports=s})();