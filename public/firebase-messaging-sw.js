importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Pegá acá exactamente el mismo firebaseConfig de tu archivo firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDMrG6_7QIdVh-0SoOYaWh9YJGfshdioDc",
  authDomain: "mitvu-push.firebaseapp.com",
  projectId: "mitvu-push",
  storageBucket: "mitvu-push.firebasestorage.app",
  messagingSenderId: "1024632929611",
  appId: "1:1024632929611:web:82561b57d3b59cfe623cce"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Este bloque se ejecuta cuando la pestaña está cerrada o en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Firebase mostrará esta notificación automáticamente:', payload);
});