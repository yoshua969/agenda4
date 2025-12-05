# 📚 Guía de Instalación - BookingMap Chile

## 🎯 Sistema de Reservas con Mapa Interactivo

Sistema completo de gestión de reservas para PYMEs y Empresas con:
- 🗺️ Mapa interactivo con geolocalización
- 📅 Sistema de reservas con horarios personalizables
- ⭐ Sistema de reseñas y calificaciones
- 👥 Panel de usuario y administrador
- 💾 Base de datos SQLite (compatible con DBeaver)

---

## 📋 Requisitos Previos

- **Node.js** v16 o superior ([descargar](https://nodejs.org/))
- **npm** (incluido con Node.js)
- **DBeaver** (opcional, para visualizar la BD)

---

## 🚀 Instalación Paso a Paso

### 1. Clonar o descargar el proyecto

\`\`\`bash
# Si tienes el proyecto en ZIP, extráelo en una carpeta
# O clónalo con git
git clone <url-del-repositorio>
cd bookingmap-chile
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install bcryptjs
\`\`\`

Esto instalará:
- Express (servidor web)
- SQLite3 (base de datos)
- bcrypt (encriptación de contraseñas)
- jsonwebtoken (autenticación)
- cookie-parser
- dotenv

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

\`\`\`env
PORT=3000
JWT_SECRET=tu-clave-secreta-super-segura-cambiame
NODE_ENV=development
\`\`\`

### 4. Iniciar el servidor

\`\`\`bash
node server.js
\`\`\`

O para modo desarrollo con auto-reinicio:

\`\`\`bash
npm run dev
\`\`\`

### 5. Agregar datos de ejemplo (opcional)

\`\`\`bash
node database/semilla.js
\`\`\`

Esto creará:
- Usuario admin: `admin@bookingmap.cl` / `admin123`
- Usuario normal: `juan@email.com` / `usuario123`
- 1 PYME (Peluquería con horarios)
- 1 Empresa (Farmacia sin reservas)

---

## 🗄️ Base de Datos SQLite

### Ubicación del archivo

El archivo de base de datos se crea automáticamente en:
\`\`\`
bookingmap-chile/
└── bookingmap.db
\`\`\`

### Conectar con DBeaver

1. Abrir DBeaver
2. Nueva Conexión → SQLite
3. Ruta del archivo: `[ruta-del-proyecto]/bookingmap.db`
4. Probar conexión → Finalizar

### Estructura de Tablas

**Usuarios** (`usuarios`)
- Almacena usuarios y administradores
- Contraseñas encriptadas con bcrypt
- Roles: 'usuario' o 'admin'

**Negocios** (`negocios`)
- PYMEs con sistema de reservas
- Empresas solo con información
- Geolocalización (latitud/longitud)

**Horarios** (`horarios_negocio`)
- Días de atención (0=Domingo, 6=Sábado)
- Horarios de apertura/cierre
- Intervalos de reserva (15, 30, 45, 60 min)

**Reservas** (`reservas`)
- Reservas de usuarios en negocios
- Estados: Confirmada, Cancelada, Completada
- Validación de horarios disponibles

**Reseñas** (`resenas`)
- Calificaciones 1-5 estrellas
- Comentarios de usuarios
- Una reseña por usuario por negocio

**Servicios** (`servicios`)
- Servicios ofrecidos por cada negocio
- Duración y precio
- Activo/Inactivo

---

## 🌐 Acceder a la Aplicación

Una vez iniciado el servidor, accede a:

\`\`\`
http://localhost:3000
\`\`\`

### Páginas disponibles:

- **Inicio**: `http://localhost:3000`
  - Mapa interactivo con negocios
  - Búsqueda por categoría
  - Geolocalización del usuario
  
- **Panel Usuario**: `http://localhost:3000/user-dashboard.html`
  - Ver mis reservas
  - Cancelar reservas
  - Editar perfil

- **Panel Admin**: `http://localhost:3000/admin-dashboard.html`
  - Agregar negocios (PYME/Empresa)
  - Configurar horarios
  - Ver estadísticas

---

## 🎨 Arquitectura del Sistema

### Patrón MVC (Modelo-Vista-Controlador)

\`\`\`
bookingmap-chile/
├── models/              # Modelos (acceso a datos)
│   ├── Usuario.js
│   ├── Negocio.js
│   ├── Reserva.js
│   └── Resena.js
├── controllers/         # Controladores (lógica de negocio)
│   ├── ControladorAutenticacion.js
│   ├── ControladorNegocios.js
│   ├── ControladorReservas.js
│   └── ControladorResenas.js
├── routes/             # Rutas de la API
│   ├── rutas-autenticacion.js
│   ├── rutas-negocios.js
│   ├── rutas-reservas.js
│   └── rutas-resenas.js
├── middleware/         # Middleware de autenticación
│   └── autenticacion.js
├── config/            # Configuración
│   └── basedatos.js
├── database/          # Scripts de BD
│   ├── inicializar.js
│   ├── schema.sql
│   └── semilla.js
├── public/            # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── user-dashboard.html
│   ├── admin-dashboard.html
│   ├── styles.css
│   └── aplicacion.js
└── servidor.js        # Servidor principal
\`\`\`

---

## ❓ ¿Por qué los HTML son tan cortos?

### Arquitectura SPA (Single Page Application)

Los archivos HTML son estructuras mínimas porque toda la interfaz se genera dinámicamente con JavaScript:

**HTML = Esqueleto vacío**
\`\`\`html
<div id="resultsList"></div>  <!-- Contenedor vacío -->
\`\`\`

**JavaScript = Rellena el contenido**
\`\`\`javascript
document.getElementById('resultsList').innerHTML = `
  <div class="card">
    <h3>${negocio.nombre}</h3>
    <p>${negocio.descripcion}</p>
    <!-- ... más contenido generado ... -->
  </div>
`
\`\`\`

### Ventajas de esta arquitectura:

1. **Interactividad**: Actualiza contenido sin recargar la página
2. **Rendimiento**: Solo envía datos JSON, no HTML completo
3. **Experiencia de usuario**: Transiciones suaves, sin parpadeos
4. **Separación**: Backend (API) independiente del Frontend

### Flujo de la aplicación:

\`\`\`
1. Usuario abre index.html (HTML vacío)
     ↓
2. Se carga aplicacion.js
     ↓
3. JavaScript hace petición a /api/negocios
     ↓
4. Servidor responde con JSON
     ↓
5. JavaScript genera HTML dinámicamente
     ↓
6. Usuario ve la interfaz completa
\`\`\`

Los archivos JavaScript (app.js, user-dashboard.js, admin-dashboard.js) tienen 800-1000 líneas porque contienen TODA la lógica de renderizado.

---

## 🔧 Comandos Útiles

\`\`\`bash
# Iniciar servidor
npm start

# Modo desarrollo (auto-reinicio)
npm run dev

# Sembrar datos de ejemplo
node database/semilla.js

# Ver estructura de BD (DBeaver)
# O desde terminal SQLite:
sqlite3 bookingmap.db ".schema"
\`\`\`

---

## 📊 Diferencias PYME vs Empresa

### PYME (con reservas)
- ✅ Sistema de reservas activado
- ✅ Horarios configurables por día
- ✅ Intervalos personalizables (15/30/45/60 min)
- ✅ Usuarios pueden reservar horas
- ✅ Panel de gestión de reservas

### Empresa (solo información)
- ❌ Sin sistema de reservas
- ✅ Solo muestra ubicación en mapa
- ✅ Información de contacto
- ❌ No tiene horarios configurables

---

## 🗺️ Sistema de Mapas

### Tecnología: Leaflet + OpenStreetMap

- **Gratuito**: No requiere API key
- **Geolocalización**: Detecta ubicación del usuario
- **Marcadores**: Colores por categoría de negocio
- **Cálculo de distancia**: Muestra distancia en km
- **Interactivo**: Clic en marcadores para ver detalles

---

## 🛟 Soporte

Si encuentras problemas:

1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que las dependencias estén instaladas: `npm list`
3. Revisa que el puerto 3000 esté disponible
4. Consulta los logs del servidor en la terminal

---

## 📄 Licencia

MIT License - Libre para uso personal y comercial
