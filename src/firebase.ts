import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Reemplazá esto con los datos que te dio Firebase en el Paso 1
const firebaseConfig = {
  apiKey: "AIzaSyDMrG6_7QIdVh-0SoOYaWh9YJGfshdioDc",
  authDomain: "mitvu-push.firebaseapp.com",
  projectId: "mitvu-push",
  storageBucket: "mitvu-push.firebasestorage.app",
  messagingSenderId: "1024632929611",
  appId: "1:1024632929611:web:82561b57d3b59cfe623cce"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos Cloud Messaging y lo exportamos
export const messaging = getMessaging(app);

// Función para pedir permiso y obtener el Token
export const solicitarTokenFCM = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Reemplazá TU_VAPID_KEY con la clave que sacaste del Paso 1
      const token = await getToken(messaging, { 
          vapidKey: "BEWkSLQmKTVUlCE0oKwSQ-lsAEqEV3Sy9smXYIPE4a-fbKnm0oAat-9KBuyatYT4-jxrQJD-kdB-K7LzPnGVNac" 
      });
      
      if (token) {
        console.log("¡Token FCM obtenido!:", token);
        // IMPORTANTE: Este token se lo vas a tener que mandar a tu backend (Spring Boot)
        // para que sepa a qué dispositivo enviarle la notificación.
        return token;
      } else {
        console.log("No se pudo obtener el token.");
      }
    } else {
      console.log("El usuario denegó el permiso para notificaciones.");
    }
  } catch (error) {
    console.error("Error al obtener el token:", error);
  }
  return null;
};

// Función para escuchar mensajes cuando la app está ABIERTA (Foreground)
export const escucharMensajesForeground = (onMessageReceived: (payload: any) => void) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage(messaging, (payload: any) => {
    console.log("Mensaje recibido con la app abierta: ", payload);
    console.log("Payload: ", payload)
    // Ejecutamos la función que le enviamos desde EstudianteDashboard
    // pasándole el payload para que React pueda usar los datos.
    onMessageReceived(payload); 
  });
};