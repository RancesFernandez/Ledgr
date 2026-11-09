# Deploy de Ledgr en Vercel

## Qué se corrigió

La aplicación podía quedar en modo demo cuando Vercel no recibía las variables `VITE_FIREBASE_*`.

La nueva versión incluye:

- configuración de Firebase para producción;
- fallback de configuración para que el frontend no dependa exclusivamente de variables locales;
- manejo claro del error `auth/unauthorized-domain`;
- login, registro y recuperación de contraseña mediante Firebase Authentication;
- persistencia de movimientos, inventario, recetas y clientes/proveedores en Firestore por usuario.

## Antes de probar el deploy

En Firebase Console, en el proyecto `ledgr-19317`:

1. Authentication → Sign-in method → habilitar **Email/Password**.
2. Authentication → Settings → Authorized domains.
3. Agregar el dominio de Vercel, por ejemplo `tu-app.vercel.app`.
4. Firestore Database → Rules → publicar el archivo `firestore.rules` incluido en este proyecto.
5. Si usás imágenes en Storage, publicar también `storage.rules`.

## Vercel

El proyecto incluye `.env.production` con la configuración del proyecto Firebase existente. También se mantiene el fallback en `src/firebase.js`, por lo que el build no debería volver a caer en modo demo por ausencia de variables de Vercel.

Si preferís manejar la configuración desde Vercel, podés crear las mismas seis variables `VITE_FIREBASE_*` en Project Settings → Environment Variables.

## Importante

La API key de Firebase usada por una aplicación web no es una contraseña. La protección real de los datos está en Firebase Authentication y Firestore Security Rules. No publicar credenciales de servidores, service accounts ni claves privadas.
