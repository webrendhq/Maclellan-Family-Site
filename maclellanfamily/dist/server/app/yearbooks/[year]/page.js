(()=>{var e={};e.id=642,e.ids=[642],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},5511:e=>{"use strict";e.exports=require("crypto")},4985:e=>{"use strict";e.exports=require("dns")},4735:e=>{"use strict";e.exports=require("events")},9021:e=>{"use strict";e.exports=require("fs")},1630:e=>{"use strict";e.exports=require("http")},3496:e=>{"use strict";e.exports=require("http2")},1645:e=>{"use strict";e.exports=require("net")},1820:e=>{"use strict";e.exports=require("os")},3873:e=>{"use strict";e.exports=require("path")},9771:e=>{"use strict";e.exports=require("process")},7910:e=>{"use strict";e.exports=require("stream")},4631:e=>{"use strict";e.exports=require("tls")},9551:e=>{"use strict";e.exports=require("url")},8354:e=>{"use strict";e.exports=require("util")},4075:e=>{"use strict";e.exports=require("zlib")},5475:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>m,pages:()=>d,routeModule:()=>p,tree:()=>c});var s=r(260),a=r(8203),i=r(5155),n=r.n(i),o=r(7292),l={};for(let e in o)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);r.d(t,l);let c=["",{children:["yearbooks",{children:["[year]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,5734)),"C:\\Users\\kevin\\OneDrive\\Documents\\GitHub\\MaclellanFamily.com2\\maclellanfamily\\app\\yearbooks\\[year]\\page.tsx"]}]},{}]},{metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,6055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,9611)),"C:\\Users\\kevin\\OneDrive\\Documents\\GitHub\\MaclellanFamily.com2\\maclellanfamily\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,9937,23)),"next/dist/client/components/not-found-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,6055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],d=["C:\\Users\\kevin\\OneDrive\\Documents\\GitHub\\MaclellanFamily.com2\\maclellanfamily\\app\\yearbooks\\[year]\\page.tsx"],m={require:r,loadChunk:()=>Promise.resolve()},p=new s.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/yearbooks/[year]/page",pathname:"/yearbooks/[year]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},5444:(e,t,r)=>{Promise.resolve().then(r.bind(r,5734))},8948:(e,t,r)=>{Promise.resolve().then(r.bind(r,7309))},7603:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,3219,23)),Promise.resolve().then(r.t.bind(r,4863,23)),Promise.resolve().then(r.t.bind(r,5155,23)),Promise.resolve().then(r.t.bind(r,9350,23)),Promise.resolve().then(r.t.bind(r,6313,23)),Promise.resolve().then(r.t.bind(r,8530,23)),Promise.resolve().then(r.t.bind(r,8921,23))},4555:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,6959,23)),Promise.resolve().then(r.t.bind(r,3875,23)),Promise.resolve().then(r.t.bind(r,8903,23)),Promise.resolve().then(r.t.bind(r,4178,23)),Promise.resolve().then(r.t.bind(r,6013,23)),Promise.resolve().then(r.t.bind(r,7190,23)),Promise.resolve().then(r.t.bind(r,1365,23))},934:()=>{},1614:()=>{},3271:(e,t,r)=>{"use strict";r.d(t,{j:()=>o});var s=r(6722),a=r(2746),i=r(7656);let n=(0,s.Wp)({apiKey:"AIzaSyCqGV5J3if7mJoH464xGx6bZ5wgU_wMn3I",authDomain:"maclellen.firebaseapp.com",projectId:"maclellen",storageBucket:"maclellen.appspot.com",messagingSenderId:"254246388059",appId:"1:254246388059:web:ca15c2405a33477665da7e"}),o=(0,a.xI)(n);(0,i.aU)(n)},7309:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>c});var s=r(5512),a=r(8009),i=r(9334);r(2746),r(3271);let n=(0,r(1680).A)("Book",[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}]]);var o=r(325),l=r(9905);function c(){let[e,t]=(0,a.useState)([]),[r,c]=(0,a.useState)(!0),[d,m]=(0,a.useState)(1),[p,u]=(0,a.useState)(!1),x=(0,i.useParams)(),h=(0,i.useRouter)(),b=x.year,v=e=>{h.push(`/yearbooks/${b}/${e}`)},y=Math.ceil(e.length/10),f=(d-1)*10,g=e.slice(f,f+10),j=e=>{m(e),window.scrollTo({top:0,behavior:"smooth"})};return r?(0,s.jsx)("div",{className:"flex items-center justify-center h-screen text-gray-600",children:"Loading contents..."}):(0,s.jsx)("div",{className:"min-h-screen bg-gradient-to-b from-amber-50 to-white p-8",children:(0,s.jsxs)("div",{className:"max-w-4xl mx-auto",children:[(0,s.jsxs)("div",{className:`text-center mb-16 transition-opacity duration-1000 ${p?"opacity-100":"opacity-0"}`,children:[(0,s.jsx)("div",{className:"flex justify-center mb-4",children:(0,s.jsx)(n,{className:"w-16 h-16 text-amber-800"})}),(0,s.jsxs)("h1",{className:"text-5xl font-serif mb-4 text-amber-900",children:[b," Yearbook"]}),(0,s.jsx)("div",{className:"text-lg text-amber-800 italic",children:"Table of Contents"}),(0,s.jsx)("div",{className:"mt-4 w-32 h-1 bg-amber-800 mx-auto"})]}),(0,s.jsxs)("div",{className:"bg-white rounded-lg shadow-xl p-12 font-serif",children:[(0,s.jsx)("div",{className:"space-y-8",children:g.map((e,t)=>(0,s.jsxs)("div",{className:`
                  flex items-baseline group
                  transition-all duration-500 transform
                  ${p?"opacity-100 translate-x-0":"opacity-0 -translate-x-4"}
                `,style:{transitionDelay:`${100*t}ms`},children:[(0,s.jsx)("div",{className:"flex-grow border-b-2 border-dotted border-amber-200 mb-1"}),(0,s.jsxs)("div",{onClick:()=>v(e.name),className:"flex items-baseline cursor-pointer group-hover:text-amber-800 transition-colors",children:[(0,s.jsx)("span",{className:"text-2xl mr-4 text-amber-900",children:(f+t+1).toString().padStart(2,"0")}),(0,s.jsx)("span",{className:"text-xl capitalize",children:e.name.replace(/-/g," ")}),(0,s.jsx)("span",{className:"ml-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity",children:"→"})]})]},e.name))}),y>1&&(0,s.jsxs)("div",{className:`
              mt-12 flex justify-center items-center gap-2
              transition-all duration-700 transform
              ${p?"opacity-100 translate-y-0":"opacity-0 translate-y-4"}
            `,style:{transitionDelay:`${100*g.length+200}ms`},children:[(0,s.jsx)("button",{onClick:()=>j(d-1),disabled:1===d,className:"p-2 rounded-full hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent",children:(0,s.jsx)(o.A,{className:"w-5 h-5 text-amber-800"})}),(()=>{let e=[];if(y<=5)for(let t=1;t<=y;t++)e.push(t);else if(d<=3){for(let t=1;t<=4;t++)e.push(t);e.push("..."),e.push(y)}else if(d>=y-2){e.push(1),e.push("...");for(let t=y-3;t<=y;t++)e.push(t)}else{e.push(1),e.push("...");for(let t=d-1;t<=d+1;t++)e.push(t);e.push("..."),e.push(y)}return e})().map((e,t)=>(0,s.jsx)("button",{onClick:()=>"number"==typeof e&&j(e),disabled:"..."===e,className:`
                    w-8 h-8 flex items-center justify-center rounded-full
                    ${e===d?"bg-amber-800 text-white":"text-amber-800 hover:bg-amber-50"}
                    ${"..."===e?"cursor-default":"cursor-pointer"}
                    font-serif text-lg transition-colors
                  `,children:e},t)),(0,s.jsx)("button",{onClick:()=>j(d+1),disabled:d===y,className:"p-2 rounded-full hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent",children:(0,s.jsx)(l.A,{className:"w-5 h-5 text-amber-800"})})]})]}),(0,s.jsx)("div",{className:`
          mt-8 text-center text-amber-800/60 font-serif italic
          transition-all duration-700 transform
          ${p?"opacity-100 translate-y-0":"opacity-0 translate-y-4"}
        `,style:{transitionDelay:`${100*g.length+400}ms`},children:"❦"})]})})}},9611:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>c,metadata:()=>l});var s=r(2740),a=r(9105),i=r.n(a),n=r(8716),o=r.n(n);r(2704);let l={title:"Maclellan Family Pictures",description:"Generated by create next app"};function c({children:e}){return(0,s.jsx)("html",{lang:"en",children:(0,s.jsx)("body",{className:`${i().variable} ${o().variable} antialiased`,children:e})})}},5734:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(6760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"C:\\\\Users\\\\kevin\\\\OneDrive\\\\Documents\\\\GitHub\\\\MaclellanFamily.com2\\\\maclellanfamily\\\\app\\\\yearbooks\\\\[year]\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"C:\\Users\\kevin\\OneDrive\\Documents\\GitHub\\MaclellanFamily.com2\\maclellanfamily\\app\\yearbooks\\[year]\\page.tsx","default")},6055:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a});var s=r(8077);let a=async e=>[{type:"image/x-icon",sizes:"16x16",url:(0,s.fillMetadataSegment)(".",await e.params,"favicon.ico")+""}]},2704:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[989,881,720,583],()=>r(5475));module.exports=s})();