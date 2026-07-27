# 5YA CS1.6 - Frontend

Proyecto frontend del Trabajo Práctico Integrador de Desarrollo Web 2025, desarrollado como una aplicación para crear y administrar salas de Counter-Strike 1.6 en formato 5 vs 5.

La aplicación permite visualizar salas públicas, registrar usuarios, iniciar sesión, acceder a una ruta privada y administrar salas persistidas en base de datos a través del backend.

## Tecnologías utilizadas

- Vite
- React
- TypeScript
- React Router DOM
- Firebase Authentication
- Context API y custom hooks para manejo de estado global
- Tailwind CSS
- Fetch API para comunicación HTTP con el backend
- Vercel para deploy

## Consigna del TP

### Desarrollar y presentar

- Proyecto Frontend alojado en repositorio Github a nombre del alumno.
- Proyecto Backend alojado en repositorio Github a nombre del alumno.
- Ambos repositorios deben contener código prolijo, segmentado en commits.
- Ambos proyectos deben estar hosteados en la nube por separado, cada uno debe poder accederse a través de una URL y deben comunicarse entre sí a través del protocolo HTTP.
- Base de datos hosteada en la nube, la cual será consumida por el proyecto backend.

La temática del proyecto es libre. Se puede utilizar cualquier tecnología siempre y cuando se respete la arquitectura API REST. Recomendación/sugerencia: stack MERN.

### Funcionalidad mínima requerida

- Ruta pública en el Frontend que visualice datos traídos desde el backend.
- Ruta pública de login en el Frontend que permita ingresar usuario y contraseña para iniciar sesión, con sus respectivas validaciones.
- Ruta privada en el Frontend, accesible solo con sesión iniciada, con un CRUD de datos guardados en la base de datos, con sus respectivas validaciones.
- El CRUD debe afectar de forma directa los datos que se muestran en la pantalla pública.
- Manejo de estado global.
- Login y registro de usuarios tanto en Backend como en Frontend.
- Funcionalidad de Logout en el Frontend y redirección al Home.

### Tecnologías recomendadas

- Frontend: Vite, React, Flexbox, React Router DOM, Redux Toolkit, Joi y React Hook Forms, Firebase, Autenticación con JWT.
- Backend: Node.js, Express, MongoDB, Mongoose, Joi, Firebase, Autenticación con JWT.
- Cloud Server: Vercel para Frontend y Render para Backend.

### Proceso de evaluación del examen final

1. Abrir la aplicación web cliente en Google Chrome, deployada en Vercel.
2. Visitar la página pública y verificar que los datos que se muestran están en la base de datos.
3. Acceder a la pantalla de login, verificando el manejo de errores, y al loguearse que redirija a la página privada.
4. Desde la página privada, ver el listado completo, dar de alta, eliminar y modificar los datos, y verificar que se actualizan en la base de datos.
5. Al eliminar se debe visualizar un popup o modal de confirmación, que permita cancelar o confirmar la operación.
6. Hacer logout y que se redirija a la página pública.
7. Ingresar por URL a la página privada estando deslogueado, y verificar que no permita acceder, o que redirija a la pantalla de login.
8. Revisar la calidad del código del Backend y del Frontend en Github y el correcto uso de las tecnologías mencionadas.
9. Correcta utilización de git/github, trabajo colaborativo e historial de commits.
10. Revisar el correcto entendimiento de las funcionalidades desarrolladas, revisando el código y charlando sobre el flujo de datos en la aplicación.

CRUD: Crear, Leer, Actualizar y Eliminar. En este proyecto la eliminación de salas se implementa como baja lógica mediante el campo `isDeleted` en MongoDB.

## Rutas del frontend

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Pública | Página principal. Muestra las salas activas traídas desde el backend. |
| `/login` | Pública | Pantalla de inicio de sesión. |
| `/registro` | Pública | Pantalla de registro de usuarios. |
| `/salas` | Privada | Panel de administración de salas. Permite crear, editar, eliminar, unirse, abandonar y administrar jugadores. |

Si un usuario intenta entrar a `/salas` sin iniciar sesión, la aplicación lo redirige automáticamente a `/login`.

## Funcionalidades implementadas

- Visualización pública de salas activas desde el backend.
- Registro de usuarios conectado al backend y Firebase.
- Login con Firebase Authentication.
- Validación de credenciales y mensajes de error.
- Ruta privada protegida.
- CRUD de salas conectado a MongoDB.
- Modal de confirmación para eliminar sala o abandonar sala.
- Logout con redirección al Home.
- Estado global con Context API y hooks propios.
- Polling cada 5 segundos para actualizar salas visibles.
- Títulos dinámicos por ruta y favicon personalizado.

## Estado global

Para el manejo de estado global se utilizó React Context junto con hooks personalizados.

El provider `AppSessionProvider` centraliza la sesión, el perfil del usuario, el listado de salas, los mensajes de error, avisos y acciones principales. Luego, el hook `useAppSession` permite consumir ese estado desde las rutas y componentes que lo necesitan.

No se utilizó Redux porque para el tamaño del proyecto Context API resuelve el flujo de datos de forma más simple y mantenible.

## Comunicación con el backend

El frontend se comunica con el backend mediante HTTP usando `fetch`.

Las rutas públicas usan requests sin token. Las rutas privadas envían el token de Firebase en el header:

```http
Authorization: Bearer <firebase_id_token>
```

El backend valida ese token con Firebase Admin antes de permitir operaciones privadas.

## Variables de entorno

El archivo `.env.example` contiene las variables necesarias:

```env
VITE_API_URL=https://uai-mdw-2025-be.vercel.app/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Ejecutar localmente

```bash
npm install
npm run dev
```

Para generar build de producción:

```bash
npm run build
```

## Links del proyecto

| Recurso | Link |
| --- | --- |
| Frontend deployado | https://uai-mdw-2025-fe.vercel.app |
| Backend deployado | https://uai-mdw-2025-be.vercel.app |
| Healthcheck backend | https://uai-mdw-2025-be.vercel.app/system/status |
| Repositorio Frontend | https://github.com/rfascendini/UAI-desarrollo-web-2025-frontend |
| Repositorio Backend | https://github.com/rfascendini/UAI-desarrollo-web-2025-backend |
