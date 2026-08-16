(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6667],{65312:function(e,r,t){"use strict";t.r(r);var a=t(85893),i=t(67294),o=t(11163),n=t(41664),s=t.n(n),l=t(89818),c=t(70148),d=t(86426),p=t(36551),f=t(2);r.default=function(){let e=(0,o.useRouter)(),[r,t]=(0,i.useState)({email:"",password:"",error:"",loading:!1}),[n,u]=(0,i.useState)(!1),[m,x]=(0,i.useState)(!1),{email:g,password:h,error:b,loading:y}=r;(0,i.useEffect)(()=>{!async function(){if(await (0,l.$8)()){let r=e.query.redirect;r?e.push(r):e.push("/student/dashboard")}}()},[e]);let k=e=>a=>{t({...r,error:!1,[e]:a.target.value})},v=async r=>{try{let t=await fetch("https://pariksha-d9q1.onrender.com/api/api/v1/auth/google",{method:"POST",body:JSON.stringify({token:r.credential}),headers:{"Content-Type":"application/json"}}),a=await t.json();if(!1===a.success){c.Am.error(a.error||"Authentication failed");return}(0,l.YR)(a.data,()=>{c.Am.success("Welcome back!");let r=e.query.redirect;r?e.push(r):e.push("/student/dashboard")})}catch{c.Am.error("Authentication error occurred!")}};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          background: #0f0c29;
        }

        /* ── Left panel ── */
        .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 80px;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100,80,220,0.25) 0%, transparent 70%);
          top: -100px; left: -100px;
          pointer-events: none;
        }
        .login-left::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(80,180,220,0.18) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          pointer-events: none;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50px;
          padding: 8px 18px;
          margin-bottom: 48px;
        }
        .brand-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #86efac;
          box-shadow: 0 0 8px #86efac;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .brand-badge span {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.5px;
        }

        .left-headline {
          font-size: clamp(32px, 3.5vw, 52px);
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 20px;
          z-index: 1;
        }
        .left-headline span {
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .left-sub {
          font-size: 16px; font-weight: 400;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 56px;
          z-index: 1;
        }

        .feature-list { z-index: 1; width: 100%; max-width: 380px; }
        .feature-item {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .feature-icon {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .fi-purple { background: rgba(167,139,250,0.18); }
        .fi-blue   { background: rgba(96,165,250,0.18); }
        .fi-green  { background: rgba(134,239,172,0.18); }
        .feature-item p {
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.7);
        }

        /* ── Right panel ── */
        .login-right {
          width: 480px;
          flex-shrink: 0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 48px;
        }

        .form-eyebrow {
          font-size: 12px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 10px;
        }
        .form-title {
          font-size: 28px; font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }
        .form-subtitle {
          font-size: 14px; color: #6b7280;
          margin-bottom: 36px;
        }

        .field-group { margin-bottom: 18px; }
        .field-label {
          display: block;
          font-size: 13px; font-weight: 600;
          color: #374151;
          margin-bottom: 7px;
        }
        .field-wrapper {
          position: relative;
        }
        .field-input {
          width: 100%;
          padding: 13px 44px 13px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px; font-weight: 400;
          color: #111827;
          background: #f9fafb;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
        }
        .field-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .field-input.has-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        .field-icon {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af; font-size: 16px;
          cursor: pointer; user-select: none;
          transition: color 0.2s;
        }
        .field-icon:hover { color: #7c3aed; }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #b91c1c;
          display: flex; align-items: center; gap: 8px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          font-size: 15px; font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          letter-spacing: 0.3px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(124,58,237,0.35);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .divider hr {
          flex: 1; border: none;
          border-top: 1.5px solid #f3f4f6;
        }
        .divider span {
          font-size: 12px; font-weight: 500;
          color: #9ca3af; white-space: nowrap;
        }

        .footer-note {
          text-align: center;
          margin-top: 28px;
          font-size: 12px; color: #9ca3af;
        }
        .footer-note a { color: #7c3aed; text-decoration: none; font-weight: 600; }

        /* Floating orbs animation */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: drift 8s ease-in-out infinite alternate;
        }
        @keyframes drift {
          from { transform: translate(0, 0); }
          to   { transform: translate(20px, 30px); }
        }
        .orb-1 { width: 220px; height: 220px; background: rgba(167,139,250,0.2); top: 15%; left: 10%; }
        .orb-2 { width: 160px; height: 160px; background: rgba(96,165,250,0.2); bottom: 20%; right: 15%; animation-delay: -4s; }
        .orb-3 { width: 100px; height: 100px; background: rgba(134,239,172,0.15); top: 55%; left: 40%; animation-delay: -2s; }

        @media (max-width: 860px) {
          .login-left { display: none; }
          .login-right { width: 100%; padding: 40px 28px; }
        }
      `}),(0,a.jsxs)("div",{className:"login-root",children:[(0,a.jsxs)("div",{className:"login-left",children:[(0,a.jsx)("div",{className:"orb orb-1"}),(0,a.jsx)("div",{className:"orb orb-2"}),(0,a.jsx)("div",{className:"orb orb-3"}),(0,a.jsxs)("div",{className:"brand-badge",children:[(0,a.jsx)("span",{className:"brand-dot"}),(0,a.jsx)("span",{children:"Live Proctored Exams"})]}),(0,a.jsxs)("h1",{className:"left-headline",children:["The smarter way to",(0,a.jsx)("br",{}),(0,a.jsx)("span",{children:"assess talent"})]}),(0,a.jsx)("p",{className:"left-sub",children:"HU-Pariksha delivers secure, AI-monitored online exams with real-time webcam proctoring and instant results."}),(0,a.jsx)("div",{className:"feature-list",children:[{icon:"\uD83C\uDFA5",cls:"fi-purple",text:"Live webcam monitoring for every test session"},{icon:"⚡",cls:"fi-blue",text:"Instant results and detailed performance reports"},{icon:"\uD83D\uDD12",cls:"fi-green",text:"Anti-tab-switch detection & integrity checks"}].map(e=>{let{icon:r,cls:t,text:i}=e;return(0,a.jsxs)("div",{className:"feature-item",children:[(0,a.jsx)("div",{className:`feature-icon ${t}`,children:r}),(0,a.jsx)("p",{children:i})]},i)})})]}),(0,a.jsxs)("div",{className:"login-right",children:[(0,a.jsx)("p",{className:"form-eyebrow",children:"Student Portal"}),(0,a.jsx)("h2",{className:"form-title",children:"Welcome back \uD83D\uDC4B"}),(0,a.jsx)("p",{className:"form-subtitle",children:"Sign in to access your exams and results."}),b&&(0,a.jsxs)("div",{className:"error-banner",children:[(0,a.jsx)("span",{children:"⚠️"})," ",b]}),(0,a.jsxs)("form",{onSubmit:a=>{if(a.preventDefault(),!g||!h){t({...r,error:"Please enter both email and password."});return}t({...r,error:!1,loading:!0}),(0,l.xJ)({email:g,password:h}).then(a=>{if(!a){t({...r,error:"Network error. Make sure you are using HTTP (not HTTPS) to avoid mixed content.",loading:!1});return}!1===a.success?t({...r,error:a.error.message||a.error,loading:!1}):(0,l.YR)(a.data,()=>{c.Am.success("Welcome back!");let r=e.query.redirect;r?e.push(r):e.push("/student/dashboard")})}).catch(e=>t({...r,error:"An unexpected error occurred.",loading:!1}))},noValidate:!0,children:[(0,a.jsxs)("div",{className:"field-group",children:[(0,a.jsx)("label",{className:"field-label",htmlFor:"login-email",children:"Email address"}),(0,a.jsxs)("div",{className:"field-wrapper",children:[(0,a.jsx)("input",{id:"login-email",type:"email",className:`field-input${b?" has-error":""}`,placeholder:"you@example.com",value:g,onChange:k("email"),autoComplete:"email"}),(0,a.jsx)("span",{className:"field-icon",children:"✉️"})]})]}),(0,a.jsxs)("div",{className:"field-group",children:[(0,a.jsx)("label",{className:"field-label",htmlFor:"login-pass",children:"Password"}),(0,a.jsxs)("div",{className:"field-wrapper",children:[(0,a.jsx)("input",{id:"login-pass",type:n?"text":"password",className:`field-input${b?" has-error":""}`,placeholder:"Enter your password",value:h,onChange:k("password"),autoComplete:"current-password"}),(0,a.jsx)("span",{className:"field-icon",onClick:()=>u(e=>!e),title:n?"Hide password":"Show password",children:n?"\uD83D\uDE48":"\uD83D\uDC41️"})]})]}),(0,a.jsx)("button",{type:"submit",className:"submit-btn",disabled:y,id:"login-submit",children:y?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(f.Z,{size:18,style:{color:"#fff"}})," Signing in…"]}):"Sign in →"})]}),(0,a.jsxs)("div",{className:"divider",children:[(0,a.jsx)("hr",{}),(0,a.jsx)("span",{children:"or continue with"}),(0,a.jsx)("hr",{})]}),(0,a.jsx)(d.kZ,{onSuccess:v,onError:()=>c.Am.error("Google login failed"),width:"100%"}),(0,a.jsxs)("div",{className:"footer-note",children:["Admin?\xa0",(0,a.jsx)(s(),{href:"/admin",children:"Sign in to admin panel →"})]})]})]}),(0,a.jsxs)(p.Z,{show:m,onHide:()=>x(!1),centered:!0,children:[(0,a.jsx)(p.Z.Header,{closeButton:!0,children:(0,a.jsx)(p.Z.Title,{children:"Sign-in Error"})}),(0,a.jsx)(p.Z.Body,{children:b})]})]})}},89818:function(e,r,t){"use strict";t.d(r,{$8:function(){return n},Ah:function(){return l},IU:function(){return a},YR:function(){return o},v9:function(){return s},xJ:function(){return i}});let a=e=>fetch("https://pariksha-d9q1.onrender.com/api/register",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(e)}).then(e=>e.json()).catch(e=>console.log(e)),i=e=>fetch("https://pariksha-d9q1.onrender.com/api/login",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(e)}).then(e=>e.json()).catch(e=>console.log(e)),o=(e,r)=>{localStorage.setItem("token",e.token),localStorage.setItem("name",e.user.name),localStorage.setItem("email",e.user.email),null!==e.user.profileUrl&&""!==e.user.profileUrl&&localStorage.setItem("profileUrl",e.user.profileUrl),r()},n=()=>localStorage.getItem("token")&&"undefined"!==localStorage.getItem("token")?localStorage.getItem("token"):(localStorage.removeItem("token"),!1),s=(e,r)=>{localStorage.setItem("admin-token",e.token),localStorage.setItem("admin-name",e.user.name),localStorage.setItem("admin-email",e.user.email),null!==e.user.profileUrl&&""!==e.user.profileUrl&&localStorage.setItem("admin-profileUrl",e.user.profileUrl),r()},l=()=>localStorage.getItem("admin-token")&&"undefined"!==localStorage.getItem("admin-token")?localStorage.getItem("admin-token"):(localStorage.removeItem("admin-token"),!1)},11163:function(e,r,t){e.exports=t(9090)},220:function(e,r,t){"use strict";t.r(r);var a=t(67294);r.default=a.createContext(null)},75068:function(e,r,t){"use strict";function a(e,r){return(a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,r){return e.__proto__=r,e})(e,r)}function i(e,r){e.prototype=Object.create(r.prototype),e.prototype.constructor=e,a(e,r)}t.d(r,{Z:function(){return i}})},63366:function(e,r,t){"use strict";function a(e,r){if(null==e)return{};var t={};for(var a in e)if(({}).hasOwnProperty.call(e,a)){if(-1!==r.indexOf(a))continue;t[a]=e[a]}return t}t.d(r,{Z:function(){return a}})},2:function(e,r,t){"use strict";t.d(r,{Z:function(){return P}});var a=t(67294),i=t(90512),o=t(20266),n=t(70917),s=t(94984),l=t(32482),c=t(77839),d=t(33737),p=t(34032),f=t(11392),u=t(74590),m=t(16787);function x(e){return(0,m.ZP)("MuiCircularProgress",e)}(0,u.Z)("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","track","circle","circleDisableShrink"]);var g=t(85893);let h=(0,n.keyframes)`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,b=(0,n.keyframes)`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,y="string"!=typeof h?(0,n.css)`
        animation: ${h} 1.4s linear infinite;
      `:null,k="string"!=typeof b?(0,n.css)`
        animation: ${b} 1.4s ease-in-out infinite;
      `:null,v=e=>{let{classes:r,variant:t,color:a,disableShrink:i}=e,n={root:["root",t,`color${(0,d.Z)(a)}`],svg:["svg"],track:["track"],circle:["circle",i&&"circleDisableShrink"]};return(0,o.Z)(n,x,r)},w=(0,s.ZP)("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.root,r[t.variant],r[`color${(0,d.Z)(t.color)}`]]}})((0,l.Z)(e=>{let{theme:r}=e,t=(0,f.Bq)(r,{animation:"none"});return{display:"inline-block",variants:[{props:{variant:"determinate"},style:{...(0,f.BP)(r,"transform")}},{props:{variant:"indeterminate"},style:y||{animation:`${h} 1.4s linear infinite`}},...t?[{props:{variant:"indeterminate"},style:t}]:[],...Object.entries(r.palette).filter((0,p.Z)()).map(e=>{let[t]=e;return{props:{color:t},style:{color:(r.vars||r).palette[t].main}}})]}})),j=(0,s.ZP)("svg",{name:"MuiCircularProgress",slot:"Svg"})({display:"block"}),S=(0,s.ZP)("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.circle,t.disableShrink&&r.circleDisableShrink]}})((0,l.Z)(e=>{let{theme:r}=e,t=(0,f.Bq)(r,{animation:"none"});return{stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{...(0,f.BP)(r,"stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:e=>{let{ownerState:r}=e;return"indeterminate"===r.variant&&!r.disableShrink},style:k||{animation:`${b} 1.4s ease-in-out infinite`}},...t?[{props:e=>{let{ownerState:r}=e;return"indeterminate"===r.variant&&!r.disableShrink},style:t}]:[]]}})),N=(0,s.ZP)("circle",{name:"MuiCircularProgress",slot:"Track"})((0,l.Z)(e=>{let{theme:r}=e;return{stroke:"currentColor",opacity:(r.vars||r).palette.action.activatedOpacity}}));var P=a.forwardRef(function(e,r){let t=(0,c.i)({props:e,name:"MuiCircularProgress"}),{className:a,color:o="primary",disableShrink:n=!1,enableTrackSlot:s=!1,min:l,max:d,size:p=40,style:f,thickness:u=3.6,value:m=t.min??0,variant:x="indeterminate",...h}=t,b=l??0,y=d??100,k={...t,color:o,disableShrink:n,size:p,thickness:u,value:m,variant:x,enableTrackSlot:s},P=v(k),C={},I={},D={};if("determinate"===x){let e=2*Math.PI*((44-u)/2),r=y-b;C.strokeDasharray=e.toFixed(3),C.strokeDashoffset=r>0?`${((y-m)/r*e).toFixed(3)}px`:`${e.toFixed(3)}px`,I.transform="rotate(-90deg)",D["aria-valuenow"]=m,D["aria-valuemin"]=b,D["aria-valuemax"]=y}return(0,g.jsx)(w,{className:(0,i.Z)(P.root,a),style:{width:p,height:p,...I,...f},ownerState:k,ref:r,role:"progressbar",...D,...h,children:(0,g.jsxs)(j,{className:P.svg,ownerState:k,viewBox:"22 22 44 44",children:[s?(0,g.jsx)(N,{className:P.track,ownerState:k,cx:44,cy:44,r:(44-u)/2,fill:"none",strokeWidth:u,"aria-hidden":"true"}):null,(0,g.jsx)(S,{className:P.circle,style:C,ownerState:k,cx:44,cy:44,r:(44-u)/2,fill:"none",strokeWidth:u})]})})})}}]);