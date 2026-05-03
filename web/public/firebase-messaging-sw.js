importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak",
  authDomain: "promptwar-cddf1.firebaseapp.com",
  projectId: "promptwar-cddf1",
  storageBucket: "promptwar-cddf1.firebasestorage.app",
  messagingSenderId: "1072664273807",
  appId: "1:1072664273807:web:9c7d9e7917ac01f5d8a1fa"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
