importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");

async function initFirebaseMessaging() {
  try {
    const response = await fetch("/api/firebase-config", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`firebase-config fetch failed: ${response.status}`);
    }

    const firebaseConfig = await response.json();
    if (!firebaseConfig || typeof firebaseConfig.apiKey !== "string" || !firebaseConfig.apiKey) {
      throw new Error("firebase-config missing apiKey");
    }

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log("[firebase-messaging-sw.js] Received background message ", payload);
      const notificationTitle = payload?.notification?.title || "CivicGuide";
      const notificationOptions = {
        body: payload?.notification?.body || "",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: payload?.data,
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.warn("[firebase-messaging-sw.js] Firebase init skipped:", error);
  }
}

initFirebaseMessaging();
