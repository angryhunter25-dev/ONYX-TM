/* ONYX login (Firebase Email/Password via REST) */
const FB_KEY="AIzaSyATXwAsKBuSbeKrm68WaHdK8KRi1AFnoQk";            /* Firebase > Project settings > Web API Key */
const OWNER_EMAIL="PASTE_OWNER_EMAIL";       /* Shivam ka owner email (small letters) */
(function(){
const A="https://identitytoolkit.googleapis.com/v1/accounts:",S="localStorage";
let st=JSON.parse(localStorage.getItem("onyx_s")||"null"),mode="login",opts={},done=null;
const save=s=>{st=s;s?localStorage.setItem("onyx_s",JSON.stringify(s)):localStorage.removeItem("onyx_s")};
const call=async(m,b)=>{const r=await fetch(A+m+"?key="+FB_KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});const j=await r.json();if(!r.ok)throw new Error(j.error&&j.error.message||"ERR");return j};
const E={EMAIL_EXISTS:"Ye email pehle se registered hai.",INVALID_LOGIN_CREDENTIALS:"Email ya password galat hai.",EMAIL_NOT_FOUND:"Ye email registered nahi hai.",INVALID_EMAIL:"Email sahi daalo.",MISSING_PASSWORD:"Password daalo."};
const msg=e=>E[e.message]||(e.message.startsWith("WEAK_PASSWORD")?"Password kam se kam 6 akshar ka rakho.":e.message.startsWith("TOO_MANY")?"Bahut try ho gaye, thodi der baad aao.":"Error: "+e.message);
function set(j){save({id:j.idToken,rt:j.refreshToken||j.refresh_token,exp:Date.now()+(+j.expiresIn||+j.expires_in||3600)*1000,email:j.email||(st&&st.email)})}
async function token(){if(!st)return"";if(st.exp-Date.now()<60000){try{const r=await fetch("https://securetoken.googleapis.com/v1/token?key="+FB_KEY,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=refresh_token&refresh_token="+st.rt});const j=await r.json();if(!r.ok)throw 0;st.id=j.id_token;st.rt=j.refresh_token;st.exp=Date.now()+(+j.expires_in)*1000;save(st)}catch(e){save(null);location.reload()}}return st.id}
const css=document.createElement("style");css.textContent=`#ox{position:fixed;inset:0;z-index:99;background:#000;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif;color:#fff}
#ox .c{width:100%;max-width:380px;background:#121212;border:1px solid #222;border-radius:24px;padding:26px 22px;text-align:center;transition:.4s}
#ox .ic{width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:#1d1d1d;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 0 22px #f5a52455}
#ox h2{margin:0 0 6px;font-size:21px}#ox p{margin:0 0 16px;font-size:13px;color:#8a8a8a}
#ox input{width:100%;padding:13px;margin:6px 0;border-radius:12px;border:1px solid #2c2c2c;background:#0c0c0c;color:#fff;font-size:15px;text-align:center}
#ox input:focus{outline:0;border-color:#f5a524}
#ox button{width:100%;padding:13px;margin-top:10px;border:0;border-radius:12px;background:#f5a524;color:#000;font-size:16px;font-weight:700}
#ox .m{min-height:18px;font-size:13px;color:#ff6b6b;margin-top:8px}
#ox .l{display:flex;justify-content:space-between;margin-top:18px;font-size:13px}#ox .l a{color:#f5a524;cursor:pointer}
#ox .c.v{border-color:#1fbf75;box-shadow:0 0 30px #1fbf7555}#ox .c.v h2{color:#1fbf75}#ox .c.w{border-color:#e53935;box-shadow:0 0 26px #e5393555}
#lo{position:fixed;top:10px;right:10px;z-index:50;background:#222;color:#bbb;border:0;border-radius:8px;padding:6px 10px;font-size:12px}`;
document.head.appendChild(css);
function ui(){let d=document.getElementById("ox");if(!d){d=document.createElement("div");d.id="ox";document.body.appendChild(d)}
const T={login:["Welcome back","Apne account se login karo","Login"],signup:["Naya account banao","Email aur password daalo","Create Account"],forgot:["Password bhool gaye?","Email daalo, reset link bhej denge","Send Reset Link"]}[mode];
d.innerHTML=`<div class="c" id="oc"><div class="ic">🔒</div><h2>${T[0]}</h2><p>${T[1]}</p>
<input id="oe" type="email" placeholder="Email" autocomplete="email">${mode=="forgot"?"":'<input id="op" type="password" placeholder="Password" autocomplete="current-password">'}${mode=="signup"?'<input id="op2" type="password" placeholder="Password dobara">':""}
<button id="ob">${T[2]}</button><div class="m" id="om"></div>
<div class="l">${mode=="login"?'<a id="a1">Create new account</a><a id="a2">Forgot password?</a>':'<a id="a1">← Login par wapas</a><span></span>'}</div></div>`;
const g=i=>document.getElementById(i),m=t=>g("om").textContent=t;
g("a1").onclick=()=>{mode=mode=="login"?"signup":"login";ui()};if(g("a2"))g("a2").onclick=()=>{mode="forgot";ui()};
g("ob").onclick=async()=>{const em=g("oe").value.trim().toLowerCase(),pw=g("op")?g("op").value:"";m("");
 if(!em){m("Email daalo.");return}
 const b=g("ob"),c=g("oc");b.textContent="Verifying...";c.className="c w";
 try{
  if(mode=="forgot"){await call("sendOobCode",{requestType:"PASSWORD_RESET",email:em});c.className="c";b.textContent="Send Reset Link";g("om").style.color="#1fbf75";m("Reset link email par bhej diya. Spam bhi check karo.");return}
  if(mode=="signup"&&pw!==g("op2").value){throw new Error("Dono password alag hain.")}
  const j=await call(mode=="signup"?"signUp":"signInWithPassword",{email:em,password:pw,returnSecureToken:true});
  if(opts.owner&&em!==OWNER_EMAIL)throw new Error("Ye owner account nahi hai.");
  set(j);st.email=em;save(st);
  c.className="c v";c.innerHTML='<div class="ic" style="box-shadow:0 0 22px #1fbf7566">✓</div><h2>Verified!</h2><p>Login ho gaya</p>';
  setTimeout(go,900)
 }catch(e){c.className="c";b.textContent=T[2];m(e.message.startsWith("WEAK")||E[e.message]||e.message.startsWith("TOO")?msg(e):e.message)}}}
function go(){const d=document.getElementById("ox");if(d)d.remove();if(!document.getElementById("lo")){const b=document.createElement("button");b.id="lo";b.textContent="Logout";b.onclick=()=>{save(null);location.reload()};document.body.appendChild(b)}done()}
window.onyxAuth=function(o,cb){opts=o||{};done=cb;
 if(FB_KEY.startsWith("PASTE")){document.body.innerHTML='<p style="color:#fff;padding:20px">auth.js me FB_KEY daalo.</p>';return}
 if(st&&(!opts.owner||st.email===OWNER_EMAIL)){token().then(()=>go())}else{if(st)save(null);ui()}};
window.onyxAuth.token=token;
})();
