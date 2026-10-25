
SAKHI SHIELD
========================================

WHAT IS INCLUDED
- index.html: welcome, login and sign-up demo
- home.html: dashboard
- setup.html: profile and permission controls
- contacts.html: add/remove trusted contacts
- sos.html: press-and-hold SOS + cancellable countdown + optional location lookup
- journey.html: safe journey setup
- check.html: Digital Shield; basic rule-based message/link warning checker
- help.html: Help & Helplines, cybercrime reporting and evidence preservation guidance
- privacy.html: Profile & Privacy, clear journey data, delete local demo data and permission guidance
- css/style.css: pastel pink/lavender styling
- js/app.js: browser-side interactions and localStorage data

HOW TO OPEN IN VS CODE (WINDOWS)
1. Download and extract sakhi_shield_vs.zip.
2. Open VS Code.
3. Select File > Open Folder.
4. Choose the extracted folder named sakhi_shield_vs.
5. In VS Code, open Extensions (left sidebar) and install "Live Server" by Ritwick Dey if you don't already have it.
6. Right-click index.html in Explorer and choose "Open with Live Server".
7. Your browser should open a localhost URL such as http://127.0.0.1:5500/index.html.
8. Create a demo account, then log in. Use the navigation bar or Home cards to open all pages.
9. Safe Journey includes an on-screen “I’m Safe” check-in; missed-check-in reminders and automatic contact alerts are not implemented.

IMPORTANT SAFETY AND TECHNICAL LIMITATIONS
- This is a FRONTEND PROTOTYPE. It does not have a backend, real authentication, secure database, SMS integration, WhatsApp integration, or automatic calls.
- Demo account password is stored in localStorage as plain text. Use only fake demo details; never use your real password or sensitive information.
- Trusted contacts, profile, journey and incidents are stored in localStorage on this browser only. They are not encrypted or synced and may disappear if browser data is cleared.
- SOS only simulates the alert process and can request the device location. It DOES NOT send messages to contacts. The phone call button opens the dialler for 112; call only when appropriate.
- Geolocation normally requires HTTPS or localhost and explicit browser permission. On a desktop computer it may return an approximate location.
- Message checker uses simple keyword rules, not a trained AI model or real URL reputation scan. A “low risk” result does not prove safety.
- Do not publish this as a real emergency service until you have a secure backend, proper consent, verified contacts, authentication, delivery-status handling, abuse prevention, privacy/security review, and extensive tests.

RECOMMENDED NEXT STEPS FOR A REAL APP
1. Backend API (FastAPI/Node) and secure password hashing.
2. Database with access control and encryption for personal data.
3. Verified notification provider (SMS/call) with explicit opt-in, delivery status and duplicate-alert protection.
4. Secure server-side incident reports and export to PDF.
5. Real threat-analysis model and URL reputation API, with clear limitations.
6. Test location and permissions on a phone using HTTPS.

