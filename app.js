const $ = (id) => document.getElementById(id);
const get = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const contacts = () => get("sakhiContacts", []);
const profile = () => get("sakhiProfile", {name:"Friend",phone:""});
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function header(){
 const host=$("appHeader"); if(!host)return;
 const page=location.pathname.split("/").pop()||"index.html";
 host.innerHTML=`<header class="topbar"><a class="top-brand" href="home.html">♡ SAKHI <span>Shield</span></a><a class="top-logout" href="index.html" id="logoutLink">Log out</a></header>
 <nav class="bottom-nav" aria-label="Main navigation">
 <a class="${page==="home.html"?"current":""}" href="home.html"><span>⌂</span><small>Home</small></a>
 <a class="${page==="journey.html"?"current":""}" href="journey.html"><span>⌖</span><small>Journey</small></a>
 <a class="${page==="check.html"?"current":""}" href="check.html"><span>♡</span><small>Digital Shield</small></a>
 <a class="${page==="help.html"?"current":""}" href="help.html"><span>＋</span><small>Help</small></a>
 <a class="${page==="privacy.html"||page==="setup.html"||page==="contacts.html"?"current":""}" href="privacy.html"><span>☻</span><small>Profile</small></a>
 </nav>`;
 $("logoutLink")?.addEventListener("click",()=>{sessionStorage.removeItem("sakhiLoggedIn");});
}
function initAuth(){const tabs=document.querySelectorAll("[data-tab]");tabs.forEach(btn=>btn.addEventListener("click",()=>{tabs.forEach(b=>b.classList.toggle("active",b===btn));$("loginForm").classList.toggle("hidden",btn.dataset.tab!=="login");$("signupForm").classList.toggle("hidden",btn.dataset.tab!=="signup");$("authMessage").textContent="";}));$("signupForm")?.addEventListener("submit",e=>{e.preventDefault();const name=$("signupName").value.trim(),email=$("signupEmail").value.trim().toLowerCase(),password=$("signupPassword").value;if(password.length<6)return;$("authMessage").textContent="Account created in this browser. You can log in now.";set("sakhiDemoAccount",{name,email,password});$("loginEmail").value=email;document.querySelector('[data-tab="login"]').click();});$("loginForm")?.addEventListener("submit",e=>{e.preventDefault();const acc=get("sakhiDemoAccount",null),email=$("loginEmail").value.trim().toLowerCase(),pw=$("loginPassword").value;if(!acc||acc.email!==email||acc.password!==pw){$("authMessage").textContent="Demo account not found or details do not match. Create an account first.";return;}set("sakhiProfile",{...profile(),name:acc.name,email});sessionStorage.setItem("sakhiLoggedIn","yes");location.href="home.html";});$("forgotBtn")?.addEventListener("click",()=>{$("authMessage").textContent="Demo only: password reset needs a secure backend and verified email flow.";});}
function initHome(){if(!$("greeting"))return;$("greeting").textContent=`Hello, ${profile().name||"friend"} 💗`;$("contactCount").textContent=contacts().length;$("locationStatus").textContent="Ask when needed";$("notifyStatus").textContent=("Notification" in window)?Notification.permission:"Unavailable";}
function initSetup(){if(!$("profileForm"))return;const p=profile();$("profileName").value=p.name==="Friend"?"":p.name;$("profilePhone").value=p.phone||"";$("setupSummary").textContent=p.name!=="Friend"?`Profile saved for ${p.name}.`:"No profile saved yet."; $("profileForm").addEventListener("submit",e=>{e.preventDefault();set("sakhiProfile",{...profile(),name:$("profileName").value.trim(),phone:$("profilePhone").value.trim()});$("setupSummary").textContent="Profile saved on this device.";notice("permissionMessage","Profile saved successfully.");});$("testLocation").addEventListener("click",()=>{if(!navigator.geolocation){notice("permissionMessage","This browser does not support location.");return;}notice("permissionMessage","Requesting location permission…");navigator.geolocation.getCurrentPosition(pos=>notice("permissionMessage",`Location available. Accuracy: about ${Math.round(pos.coords.accuracy)} metres. Coordinates are not uploaded.`),err=>notice("permissionMessage",err.code===1?"Location permission was denied. You can change it in browser settings.":"Could not get location. Try HTTPS or localhost and check device settings."),{enableHighAccuracy:true,timeout:10000});});$("enableNotifications").addEventListener("click",async()=>{if(!("Notification" in window)){notice("permissionMessage","Notifications are not supported in this browser.");return;}try{const result=await Notification.requestPermission();notice("permissionMessage",`Notification permission: ${result}.`);}catch{notice("permissionMessage","Could not request notifications.");}});$("finishSetup").addEventListener("click",()=>location.href="home.html");}
function notice(id,msg){const el=$(id);if(el)el.textContent=msg;}
function renderContacts(){const list=$("contactsList");if(!list)return;const all=contacts();list.innerHTML=all.length?all.map((c,i)=>`<article class="contact-item"><div class="contact-avatar">♡</div><div class="contact-info"><b>${escapeHtml(c.name)}</b><small>${escapeHtml(c.phone)}${c.relation?" · "+escapeHtml(c.relation):""}</small></div><button class="delete-btn" data-delete="${i}" aria-label="Remove ${escapeHtml(c.name)}">Remove</button></article>`).join(""):`<div class="panel muted">No trusted contacts added yet. Add someone you trust above.</div>`;list.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{const next=contacts();next.splice(Number(b.dataset.delete),1);set("sakhiContacts",next);renderContacts();}));}
function initContacts(){if(!$("contactForm"))return;$("contactForm").addEventListener("submit",e=>{e.preventDefault();const all=contacts();all.push({name:$("contactName").value.trim(),phone:$("contactPhone").value.trim(),relation:$("contactRelation").value.trim()});set("sakhiContacts",all);e.target.reset();notice("contactMessage","Contact saved in this browser.");renderContacts();});renderContacts();}
let countdownTimer=null,holdTimer=null,remaining=5;
function initSOS(){const btn=$("sosHold");if(!btn)return;const startHold=e=>{e.preventDefault();btn.classList.add("holding");holdTimer=setTimeout(()=>{btn.classList.remove("holding");beginCountdown();},1500);};const stopHold=()=>{clearTimeout(holdTimer);btn.classList.remove("holding");};btn.addEventListener("pointerdown",startHold);["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,stopHold));$("cancelSOS").addEventListener("click",()=>{clearInterval(countdownTimer);$("countdownBox").classList.add("hidden");$("sosInstruction").textContent="Alert cancelled. No message was sent.";});}
function beginCountdown(){remaining=5;$("countdownNumber").textContent=remaining;$("countdownBox").classList.remove("hidden");$("sosInstruction").textContent="Demo countdown started. Cancel any time.";clearInterval(countdownTimer);countdownTimer=setInterval(()=>{remaining--;$("countdownNumber").textContent=remaining;if(remaining<=0){clearInterval(countdownTimer);simulateSOS();}},1000);}
function simulateSOS(){const result=$("sosResult");result.classList.remove("hidden");$("sosResultText").textContent=`Demo complete for ${profile().name||"user"}. No real alert was sent.`;$("countdownBox").classList.add("hidden");const details=$("locationDetails");details.textContent="Checking location permission…";if(navigator.geolocation){navigator.geolocation.getCurrentPosition(pos=>{const lat=pos.coords.latitude,lon=pos.coords.longitude,stamp=new Date().toLocaleString();details.innerHTML=`Location obtained at ${escapeHtml(stamp)}. Accuracy: ±${Math.round(pos.coords.accuracy)} m. <a class="text-link" target="_blank" rel="noopener" href="https://maps.google.com/?q=${lat},${lon}">Open map link</a>. Coordinates are shown only in this session.`;},()=>details.textContent="Location unavailable or permission denied. No location was shared.",{enableHighAccuracy:true,timeout:8000});}else details.textContent="Geolocation not supported. No location was shared.";}
function initJourney(){if(!$("journeyForm"))return;const select=$("journeyContact");contacts().forEach(c=>{const opt=document.createElement("option");opt.value=c.phone;opt.textContent=`${c.name} (${c.phone})`;select.appendChild(opt);});$("journeyForm").addEventListener("submit",e=>{e.preventDefault();const journey={start:$("journeyStart").value.trim(),destination:$("journeyDestination").value.trim(),arrival:$("arrivalTime").value,contact:select.value};set("sakhiJourney",journey);$("activeJourney").classList.remove("hidden");$("journeySummary").textContent=`${journey.start?journey.start+" → ":""}${journey.destination}. Expected arrival: ${new Date(journey.arrival).toLocaleString()}. This page does not send check-in alerts.`;notice("journeyMessage","Journey saved in this browser.");});$("endJourney").addEventListener("click",()=>{$("activeJourney").classList.add("hidden");localStorage.removeItem("sakhiJourney");notice("journeyMessage","Journey ended.");});const saved=get("sakhiJourney",null);if(saved){$("activeJourney").classList.remove("hidden");$("journeySummary").textContent=`${saved.start?saved.start+" → ":""}${saved.destination}. Expected arrival: ${new Date(saved.arrival).toLocaleString()}.`;}}
let latestAnalysis=null;
function initCheck(){if(!$("checkForm"))return;$("checkForm").addEventListener("submit",e=>{e.preventDefault();const text=$("messageInput").value.trim();const lower=text.toLowerCase();const reasons=[];const patterns=[[/\b(otp|password|bank details|card number)\b/,"Requests sensitive credentials or financial information"],[/\b(urgent|immediately|act now|account.*(block|suspend))\b/,"Uses urgency or account-pressure language"],[/\b(blackmail|leak|expose|publish|share your photos|private photos)\b/,"Contains possible coercion, blackmail, or privacy-threat language"],[/\b(send money|pay now|gift card|upi)\b/,"Mentions payment or money transfer"],[/https?:\/\/|www\./,"Contains a web link that should be checked carefully"],[/\b(threaten|kill you|hurt you|find you)\b/,"Contains potentially threatening language"]];patterns.forEach(([re,why])=>{if(re.test(lower))reasons.push(why);});let risk=reasons.length>=2?"High":reasons.length===1?"Caution":"No obvious flags";latestAnalysis={text,risk,reasons,date:new Date().toISOString()};$("checkResult").classList.remove("hidden");$("riskTitle").innerHTML=`<span class="risk-badge ${risk==="High"?"high":risk==="No obvious flags"?"low":""}">${risk} risk indicators</span>`;$("riskDescription").textContent=risk==="High"?"Several common warning signs were found. Avoid replying, clicking links, or sending money until verified.":risk==="Caution"?"A possible warning sign was found. Verify through an independent trusted channel.":"No listed warning signs were detected. This does not guarantee the message or link is safe.";const ul=$("riskReasons");ul.innerHTML=(reasons.length?reasons:["No simple rule matched. A real threat can still be missed."]).map(r=>`<li>${escapeHtml(r)}</li>`).join("");});$("saveIncident").addEventListener("click",()=>{if(!latestAnalysis)return;const incidents=get("sakhiIncidents",[]);incidents.unshift(latestAnalysis);set("sakhiIncidents",incidents);notice("riskDescription","Incident saved locally in this browser. "+$("riskDescription").textContent);});}
header();initAuth();initHome();initSetup();initContacts();initSOS();initJourney();initCheck();


// Extra Safe Journey check-in actions (prototype: visible reminders only, no background alerts)
function initJourneyExtras(){
 const active=$("activeJourney"); if(!active)return;
 if(!$("journeyCheckin")){
   const row=document.createElement("div");row.className="journey-actions";
   row.innerHTML='<button id="journeyCheckin" class="btn primary" type="button">♡ I’m Safe</button> <button id="stopLocationSharingJourney" class="btn secondary" type="button">Stop location sharing</button><p id="journeyCheckinMessage" class="notice" aria-live="polite"></p>';
   active.appendChild(row);
 }
 $("journeyCheckin")?.addEventListener("click",()=>{
   const j=get("sakhiJourney",null); if(!j){notice("journeyCheckinMessage","No active journey found.");return;}
   j.lastCheckin=new Date().toISOString();j.status="checked-in";set("sakhiJourney",j);
   notice("journeyCheckinMessage","You marked yourself safe at "+new Date(j.lastCheckin).toLocaleString()+". No contact notification was sent.");
 });
 $("stopLocationSharingJourney")?.addEventListener("click",()=>{
   const j=get("sakhiJourney",null);if(j){j.locationSharing=false;set("sakhiJourney",j);}
   notice("journeyCheckinMessage","Location sharing is not active in this demo. Journey details remain saved until you end or clear the journey.");
 });
}
function initPrivacyPage(){
 if(!$("privacyProfileForm"))return;
 const p=profile();$("privacyName").value=p.name==="Friend"?"":p.name||"";$("privacyPhone").value=p.phone||"";
 const perms=get("sakhiPermissions",{});
 $("privacyPermissionStatus").textContent=`Location permission: ${perms.location||"not checked"} · Notifications: ${perms.notifications||(("Notification" in window)?Notification.permission:"unavailable")}`;
 $("privacyProfileForm").addEventListener("submit",e=>{e.preventDefault();set("sakhiProfile",{...profile(),name:$("privacyName").value.trim(),phone:$("privacyPhone").value.trim()});notice("privacyMessage","Profile updated in this browser.");});
 $("stopLocationSharing").addEventListener("click",()=>{localStorage.removeItem("sakhiJourney");notice("privacyPermissionMessage","Saved journey cleared. This demo does not run continuous location sharing.");});
 $("manageLocationPermission").addEventListener("click",()=>notice("privacyPermissionMessage","In Chrome: click the tune/lock icon beside the address bar → Site settings → Location / Notifications → choose Allow, Ask or Block."));
 $("deleteJourneyHistory").addEventListener("click",()=>{localStorage.removeItem("sakhiJourney");localStorage.removeItem("sakhiJourneyHistory");notice("deleteMessage","Saved journey and journey history cleared from this browser.");});
 $("deleteAllLocalData").addEventListener("click",()=>{if(!confirm("Delete all SAKHI Shield demo data stored in this browser? This cannot be undone."))return;["sakhiDemoAccount","sakhiProfile","sakhiContacts","sakhiJourney","sakhiJourneyHistory","sakhiIncidents","sakhiPermissions","sakhiSetupComplete"].forEach(k=>localStorage.removeItem(k));sessionStorage.removeItem("sakhiLoggedIn");notice("deleteMessage","SAKHI demo data cleared. Redirecting to welcome page…");setTimeout(()=>location.href="index.html",1200);});
}
initJourneyExtras();initPrivacyPage();


// Shared contact manager enhancements: emergency flag, duplicate prevention, edit/remove confirmation.
function enhanceContacts(){
 const form=$("contactForm");
 if(!form || $("emergencyContact")) return;
 const relation=$("contactRelation");
 if(!relation)return;
 const wrapper=document.createElement("label");
 wrapper.className="toggle-row";
 wrapper.innerHTML='<input id="emergencyContact" type="checkbox"> Use as an emergency contact';
 relation.parentElement.insertAdjacentElement("afterend",wrapper);
 const submit=form.querySelector('button[type="submit"]');
 form.addEventListener("submit",function(e){
   const name=$("contactName")?.value.trim().toLowerCase();
   const phone=($("contactPhone")?.value||"").replace(/[^\d+]/g,"");
   const editing=$("editContactId")?.value||"";
   const duplicate=contacts().some(c=>c.id!==editing &&
      ((String(c.name||"").trim().toLowerCase()===name) ||
       (String(c.phone||"").replace(/[^\d+]/g,"")===phone)));
   if(duplicate){e.preventDefault();e.stopImmediatePropagation();const msg=$("contactMessage");if(msg)msg.textContent="A contact with this name or phone number already exists.";return;}
 },true);
}
document.addEventListener("DOMContentLoaded",enhanceContacts);


// Digital Shield rule-based contextual analysis. Warnings are not a guarantee of safety.
(function(){
 const form=$("checkForm"); if(!form || !$("messageInput"))return;
 let mode="message";
 const textarea=$("messageInput"),label=$("contentLabel");
 $("messageTab")?.addEventListener("click",()=>{mode="message";label.firstChild.textContent="Message to check";textarea.placeholder="Paste a message here…";$("messageTab").className="btn primary";$("linkTab").className="btn secondary";$("checkResult").classList.add("hidden")});
 $("linkTab")?.addEventListener("click",()=>{mode="link";label.firstChild.textContent="Link to check";textarea.placeholder="Paste a URL here…";$("linkTab").className="btn primary";$("messageTab").className="btn secondary";$("checkResult").classList.add("hidden")});
 $("clearCheck")?.addEventListener("click",()=>{textarea.value="";$("checkResult").classList.add("hidden")});
 form.addEventListener("submit",e=>{
  e.preventDefault(); const raw=textarea.value.trim(),t=raw.toLowerCase(),reasons=[],actions=[];
  const negation=/\b(never|don't|do not|dont|avoid|shouldn't|should not|cannot|can't|not to|without)\b/i.test(raw);
  if(mode==="message"){
   if(/\b(send|share|give|tell|provide|enter|confirm)\b.{0,35}\b(otp|one[- ]time password|password|pin|passcode)\b/i.test(raw) && !negation) {reasons.push("The text appears to request an OTP, password, PIN or passcode.");actions.push("Never share OTPs, passwords or PINs. Contact the organisation using an independently verified channel.");}
   if(/\b(blackmail|blackmailing|pay or|leak (your|the)|share your (photos|pictures|video)|sextortion|extort)\b/i.test(t)){reasons.push("Possible blackmail, coercion or threat language is present.");actions.push("Avoid paying or negotiating if it may increase risk; preserve evidence and seek trusted support.");}
   if(/\b(threaten|kill you|hurt you|i will find you|you will regret|threat|violence)\b/i.test(t)){reasons.push("Threatening or intimidating language may be present.");actions.push("If you believe danger is immediate, move to safety and contact emergency help.");}
   if(/\b(urgent|immediately|within \d+ minutes|act now|account (will be|is) (blocked|suspended)|last warning)\b/i.test(t)){reasons.push("The message uses urgency or pressure to act quickly.");actions.push("Pause and verify the request independently before taking action.");}
   if(/\b(pay|transfer|send money|upi|bank account|refund|prize|fee)\b/i.test(t)){reasons.push("The message mentions a payment or financial action; verify it carefully.");actions.push("Do not transfer money based only on a message or unexpected link.");}
   if(negation && reasons.length===0){reasons.push("The text may be warning against unsafe behaviour rather than requesting it.");}
  } else {
   try {const u=new URL(raw.match(/https?:\/\/\S+/i)?.[0]||raw);const host=u.hostname.toLowerCase();if(u.protocol!=="https:")reasons.push("The link does not use HTTPS.");if(/^\d{1,3}(\.\d{1,3}){3}$/.test(host))reasons.push("The URL uses an IP address instead of a familiar domain name.");if(host.includes("xn--"))reasons.push("The domain uses encoded characters that can sometimes imitate other domains.");if(host.split(".").length>4)reasons.push("The domain has an unusually long chain of subdomains.");if(/login|verify|secure|update|claim|gift|free|wallet|bank/i.test(u.pathname+" "+host))reasons.push("The URL contains words often used in account-verification or offer lures; context matters.");}
   catch{reasons.push("This does not look like a complete valid URL.");}
   if(reasons.length)actions.push("Do not sign in, download files or enter payment details until you verify the domain independently.");
  }
  if(!reasons.length){$("riskTitle").textContent="No recognised warning signs";$("riskDescription").textContent="The basic checker did not find its configured patterns. This does not mean the content is guaranteed safe.";}
  else{$("riskTitle").textContent="Potential warning signs found";$("riskDescription").textContent="Review the reasons below. This rule-based prototype can miss risks or flag harmless content.";}
  $("riskReasons").innerHTML=reasons.map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  $("suggestedActions").innerHTML=(actions.length?actions:["Verify the sender and context independently. If unsure, do not click or reply."]).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  $("checkResult").classList.remove("hidden");
 });
})();

// Privacy controls are local-demo only; permissions must be changed in browser settings.
(function(){
 if(!$("privacyProfileForm"))return;
 const p=profile();$("privacyName").value=p.name||"";$("privacyPhone").value=p.phone||"";
 $("privacyProfileForm").addEventListener("submit",e=>{e.preventDefault();set("sakhiProfile",{...profile(),name:$("privacyName").value.trim(),phone:$("privacyPhone").value.trim()});$("privacyMessage").textContent="Profile saved on this browser.";});
 const status=$("privacyPermissionStatus");if(status){let geo="unknown",noti="unsupported";try{noti=("Notification"in window)?Notification.permission:"unsupported"}catch{};status.textContent=`Notifications: ${noti}. Location access is managed by your browser/device; this page cannot reliably read all browser permission states.`;}
 $("showPermissionHelp")?.addEventListener("click",()=>$("permissionHelp").classList.toggle("hidden"));
 $("stopLocationSharing")?.addEventListener("click",()=>{if(confirm("Stop the active demo journey and clear its saved location?")){localStorage.removeItem("sakhiActiveJourney");localStorage.removeItem("sakhiJourneyLocation");$("sharingMessage").textContent="Location sharing stopped for this demo. No background tracking is running."; }});
 $("deleteJourneyHistory")?.addEventListener("click",()=>{if(confirm("Delete all saved journey history on this browser?")){localStorage.removeItem("sakhiJourneyHistory");localStorage.removeItem("sakhiActiveJourney");$("sharingMessage").textContent="Saved journey history deleted from this browser."; }});
 const select=$("defaultEmergencyContact");if(select){contacts().forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.name+" — "+c.phone;select.appendChild(o)});select.value=localStorage.getItem("sakhiDefaultEmergencyContact")||"";}
 const settings=get("sakhiSosSettings",{countdown:"5"});if($("sosCountdown"))$("sosCountdown").value=settings.countdown;
 $("saveSosSettings")?.addEventListener("click",()=>{set("sakhiSosSettings",{countdown:$("sosCountdown").value});localStorage.setItem("sakhiDefaultEmergencyContact",select?.value||"");$("sosSettingsMessage").textContent="SOS preferences saved locally. They do not send alerts by themselves.";});
 $("openSmsFallback")?.addEventListener("click",()=>{const c=contacts().find(x=>x.id===select?.value)||contacts().find(x=>x.emergency);if(!c){$("smsMessage").textContent="Add/select a trusted contact first.";return;}const body=encodeURIComponent(`SAKHI Shield safety check: I may need assistance. Please contact me. This message was prepared by me and needs to be sent manually.`);location.href=`sms:${c.phone}?body=${body}`;$("smsMessage").textContent="Opened an SMS draft if your device supports it. Review and press Send yourself; this app does not send SMS automatically.";});
 $("privacyLogout")?.addEventListener("click",()=>{if(confirm("End the active demo journey and log out?")){localStorage.removeItem("sakhiActiveJourney");sessionStorage.removeItem("sakhiLoggedIn");location.href="index.html";}});
 $("deleteAllData")?.addEventListener("click",()=>{if(confirm("Delete all SAKHI Shield demo data stored in this browser? This cannot delete information shared externally.")){Object.keys(localStorage).filter(k=>k.startsWith("sakhi")).forEach(k=>localStorage.removeItem(k));sessionStorage.removeItem("sakhiLoggedIn");location.href="index.html";}});
})();

// Journey interactions: selected contacts, on-page grace period, check-in, extend, stop and location snapshot.
(function(){
 const form=$("journeyForm");if(!form)return;
 const select=$("journeyContact");
 if(select){select.innerHTML=contacts().map(c=>`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} — ${escapeHtml(c.phone)}</option>`).join("")||'<option value="">No saved contacts — add one in Trusted Contacts</option>';}
 const activeBox=$("activeJourney");let timer=null,graceTimer=null;
 const getJourney=()=>get("sakhiActiveJourney",null);
 function updateRemaining(){const j=getJourney();if(!j||!$("remainingTime"))return;const ms=new Date(j.arrival).getTime()-Date.now();if(ms>0){$("remainingTime").textContent=`${Math.floor(ms/60000)} min ${Math.floor(ms%60000/1000)} sec remaining`;return;}if(!$("journeyStatus"))return;$("journeyStatus").textContent="Expected arrival time passed — have you reached safely?";if(!j.graceStarted){j.graceStarted=true;j.graceUntil=Date.now()+2*60*1000;set("sakhiActiveJourney",j);$("journeyMessage").textContent="Please check in within 2 minutes. This demo can only remind you while this page is open.";if(graceTimer)clearTimeout(graceTimer);graceTimer=setTimeout(()=>{const latest=getJourney();if(latest&&!latest.completed&&!latest.safe){$("journeyMessage").textContent="Missed response: no check-in received in the grace period. No contacts were alerted by this prototype. Last known location is shown below if available.";if($("latestLocation"))$("latestLocation").textContent=latest.locationText||"No location snapshot available";}},2*60*1000);}}
 function showActive(j){if(!activeBox)return;activeBox.classList.remove("hidden");if($("journeyDestinationText"))$("journeyDestinationText").textContent=j.destination;if($("journeyArrivalText"))$("journeyArrivalText").textContent=new Date(j.arrival).toLocaleString();if($("journeyContactText"))$("journeyContactText").textContent=(j.contactNames||[]).join(", ")||"No contacts selected";updateRemaining();if(timer)clearInterval(timer);timer=setInterval(updateRemaining,1000);}
 const existing=getJourney();if(existing&&!existing.completed){showActive(existing);form.classList.add("hidden");}
 form.addEventListener("submit",e=>{e.preventDefault();const arrival=$("arrivalTime").value;if(new Date(arrival).getTime()<=Date.now()){$("journeyMessage").textContent="Choose a future arrival time.";return;}const selected=[...(select?.selectedOptions||[])].map(o=>o.value).filter(Boolean);const all=contacts();const j={id:String(Date.now()),destination:$("journeyDestination").value.trim(),arrival:new Date(arrival).toISOString(),contactIds:selected,contactNames:all.filter(c=>selected.includes(c.id)).map(c=>c.name),startedAt:new Date().toISOString(),completed:false,safe:false,graceStarted:false};set("sakhiActiveJourney",j);const hist=get("sakhiJourneyHistory",[]);hist.push({...j});set("sakhiJourneyHistory",hist);form.classList.add("hidden");showActive(j);$("journeyMessage").textContent="Journey started in this browser. Live background sharing and automatic contact alerts need a backend.";});
 $("imSafe")?.addEventListener("click",()=>{const j=getJourney();if(!j)return;j.completed=true;j.safe=true;j.completedAt=new Date().toISOString();set("sakhiActiveJourney",j);localStorage.removeItem("sakhiJourneyLocation");if(timer)clearInterval(timer);if(graceTimer)clearTimeout(graceTimer);$("journeyStatus").textContent="Journey completed — glad you checked in 💗";$("journeyMessage").textContent="Marked safe. Demo location sharing stopped.";["imSafe","extendJourney","stopJourney"].forEach(id=>{if($(id))$(id).disabled=true;});});
 $("extendJourney")?.addEventListener("click",()=>{const j=getJourney();if(!j)return;const current=new Date(j.arrival);const value=prompt("Enter new arrival time (YYYY-MM-DDTHH:MM)",`${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,"0")}-${String(current.getDate()).padStart(2,"0")}T${String(current.getHours()).padStart(2,"0")}:${String(current.getMinutes()).padStart(2,"0")}`);if(!value)return;if(new Date(value).getTime()<=Date.now()){alert("Choose a future time.");return;}j.arrival=new Date(value).toISOString();j.graceStarted=false;set("sakhiActiveJourney",j);if($("journeyArrivalText"))$("journeyArrivalText").textContent=new Date(j.arrival).toLocaleString();$("journeyStatus").textContent="Arrival time extended";});
 $("stopJourney")?.addEventListener("click",()=>{if(!confirm("Stop this journey and end sharing?"))return;const j=getJourney();if(j){j.completed=true;j.stoppedAt=new Date().toISOString();set("sakhiActiveJourney",j);}localStorage.removeItem("sakhiJourneyLocation");if(timer)clearInterval(timer);activeBox?.classList.add("hidden");form.classList.remove("hidden");$("journeyMessage").textContent="Journey stopped. No contacts were notified by this demo.";});
 $("refreshLocation")?.addEventListener("click",()=>{if(!navigator.geolocation){$("latestLocation").textContent="Geolocation not supported by this browser.";return;} $("latestLocation").textContent="Requesting location…";navigator.geolocation.getCurrentPosition(pos=>{const lat=pos.coords.latitude,lon=pos.coords.longitude,stamp=new Date().toLocaleString();const link=`https://maps.google.com/?q=${lat},${lon}`;const txt=`Location snapshot: ${lat.toFixed(5)}, ${lon.toFixed(5)} — ${link}`;$("latestLocation").innerHTML=`${escapeHtml(lat.toFixed(5))}, ${escapeHtml(lon.toFixed(5))} · <a target="_blank" rel="noopener" href="${link}">Open map</a>`;$("locationUpdated").textContent=`Last updated: ${stamp} (accuracy ±${Math.round(pos.coords.accuracy)} m)`;const j=getJourney();if(j){j.locationText=txt;j.locationUpdatedAt=stamp;set("sakhiActiveJourney",j);}set("sakhiJourneyLocation",{lat,lon,stamp});},()=>{$("latestLocation").textContent="Location unavailable. Check browser permission and use localhost/HTTPS.";});});
})();
