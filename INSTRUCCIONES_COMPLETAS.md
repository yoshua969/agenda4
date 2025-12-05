# 📘 BookingMap Chile - Sistema de Reservas con Mapa

## 🎯 Resumen del Sistema

**BookingMap Chile** es una plataforma completa de reservas en línea con las siguientes características:

### ✅ Funcionalidades Implementadas

#### Para Administradores:
- Agregar PYMEs con horarios personalizados (intervalos de 15, 30, 45, 60 minutos)
- Agregar Empresas (solo información de ubicación, sin reservas)
- Ver todas las reservas del sistema
- Eliminar y modificar negocios
- Ver estadísticas completas

#### Para Usuarios:
- Registrarse e iniciar sesión
- Ver negocios en mapa interactivo (Leaflet + OpenStreetMap)
- Agendar hora en PYMEs (solo horarios disponibles)
- Ver mis reservas
- Cancelar reservas
- Dejar comentarios y estrellas (1-5) en negocios
- Ver ubicación del usuario en tiempo real

### 🏗️ Arquitectura

**Patrón MVC Puro en Node.js + Express + SQLite**

\`\`\`
bookingmap-chile/
├── config/
│   └── basedatos.js          # Configuración SQLite
├── database/
│   └── inicializar.js         # Esquema de base de datos
├── models/
│   ├── Usuario.js
│   ├── Negocio.js
│   ├── Reserva.js
│   └── Resena.js
├── controllers/
│   ├── ControladorAutenticacion.js
│   ├── ControladorNegocios.js
│   ├── ControladorReservas.js
│   └── ControladorResenas.js
├── routes/
│   ├── rutas-autenticacion.js
│   ├── rutas-negocios.js
│   ├── rutas-reservas.js
│   └── rutas-resenas.js
├── middleware/
│   └── autenticacion.js       # JWT middleware
├── public/
│   ├── index.html
│   ├── panel-usuario.html
│   ├── panel-admin.html
│   ├── estilos.css
│   ├── aplicacion.js
│   ├── user-dashboard.js
│   └── admin-dashboard.js
├── servidor.js                # Punto de entrada
├── package.json
├── .env
└── bookingmap.db             # Base de datos SQLite (se crea automáticamente)
\`\`\`

## 📦 Instalación

### 1. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar variables de entorno

Crear archivo `.env`:

\`\`\`env
PORT=3000
JWT_SECRET=tu_clave_secreta_super_segura_aqui
NODE_ENV=development
\`\`\`

### 3. Iniciar el servidor

\`\`\`bash
npm install bcryptjs
\`\`\`

Para desarrollo con reinicio automático:

\`\`\`bash
node server.js
\`\`\`

### 4. Acceder a la aplicación

Abrir navegador en: `http://localhost:3000`

**Credenciales de admin por defecto:**
- Email: `admin@bookingmap.cl`
- Contraseña: `admin123`

## 🗄️ Base de Datos SQLite

### Ubicación

El archivo de base de datos se crea automáticamente en: `./bookingmap.db`

### Conectar con DBeaver

1. **Descargar DBeaver**: https://dbeaver.io/download/
2. **Instalar y abrir DBeaver**
3. **Crear nueva conexión**:
   - Click en "Nueva Conexión" o `Ctrl+N`
   - Seleccionar **SQLite**
   - Click en "Siguiente"

4. **Configurar conexión**:
   - **Path**: Seleccionar el archivo `bookingmap.db` en la carpeta del proyecto
   - Ejemplo: `/ruta/completa/al/proyecto/bookingmap-chile/bookingmap.db`
   - Click en "Probar Conexión"
   - Si aparece un mensaje sobre drivers, click en "Descargar"
   - Click en "Finalizar"

5. **Explorar datos**:
   - Expandir la conexión en el panel izquierdo
   - Ver tablas en: `bookingmap > main > Tables`
   - Doble click en cualquier tabla para ver datos

### Estructura de Tablas

#### usuarios
- id, nombre, email, telefono, contraseña (hash), rol, fecha_creacion

#### negocios
- id, nombre, descripcion, categoria, direccion, latitud, longitud, telefono, tipo_negocio (pyme/empresa), tipo (reservable/solo-info)

#### horarios_negocio
- id, id_negocio, dia_semana (0-6), hora_apertura, hora_cierre, intervalo_reserva (15/30/45/60)

#### reservas
- id, id_negocio, id_usuario, fecha, hora, servicio, notas, estado (Confirmada/Cancelada)

#### resenas
- id, id_negocio, id_usuario, calificacion (1-5), comentario, fecha_creacion

#### categorias
- id, codigo (beauty/health/automotive/shopping/food), nombre, icono, color

## 🎨 Diseño

### Sistema de Colores

El diseño usa una paleta de colores moderna y profesional:

- **Primario**: `#2563eb` (Azul)
- **Secundario**: `#6b7280` (Gris)
- **Éxito**: `#10b981` (Verde)
- **Peligro**: `#ef4444` (Rojo)
- **Advertencia**: `#f59e0b` (Naranja)
- **Info**: `#3b82f6` (Azul claro)

### Categorías con Colores

- **Belleza**: `#ec4899` (Rosa)
- **Salud**: `#10b981` (Verde)
- **Automotriz**: `#f59e0b` (Naranja)
- **Compras**: `#8b5cf6` (Morado)
- **Comida**: `#ef4444` (Rojo)

### Componentes UI

- Modales con animaciones suaves
- Botones con estados hover y transiciones
- Formularios con validación visual
- Tarjetas de negocios con sombras
- Mapa interactivo con marcadores personalizados
- Sistema de notificaciones toast
- Spinner de carga
- Diseño responsive (mobile-first)

## 🔧 Solución de Problemas

### La página no carga

1. Verificar que el servidor esté corriendo: `npm start`
2. Verificar consola del navegador (F12) para errores
3. Verificar que el puerto 3000 esté disponible

### Error al conectar base de datos

1. Verificar que SQLite esté instalado: `npm install sqlite3`
2. Verificar permisos de escritura en la carpeta del proyecto
3. Eliminar `bookingmap.db` y reiniciar el servidor para recrearla

### No aparecen negocios en el mapa

1. Permitir geolocalización en el navegador
2. Verificar consola del navegador para errores de API
3. Verificar que haya negocios creados (usar el panel de admin)

### DBeaver no conecta a SQLite

1. Asegurarse de que el servidor **NO esté corriendo** al usar DBeaver
2. SQLite solo permite una conexión de escritura a la vez
3. Cerrar el servidor, usar DBeaver, luego reiniciar el servidor

### Los HTMLs son muy cortos

**Esto es normal**. La aplicación usa arquitectura **SPA (Single Page Application)**:

- **HTML**: Solo define estructura básica (200 líneas)
- **JavaScript**: Genera TODO el contenido dinámicamente (1000+ líneas)
- **Ventaja**: Actualización sin recargar página, experiencia más rápida

El contenido se renderiza dinámicamente cuando interactúas con la página.

## 📚 Diferencias PYME vs Empresa

### PYME (`tipo_negocio: 'pyme'`)
- Sistema de reservas completo
- Horarios por día de semana configurables
- Intervalos personalizables (15/30/45/60 min)
- Lista de servicios
- Usuario puede agendar hora
- Muestra horarios disponibles en tiempo real

### Empresa (`tipo_negocio: 'empresa'`)
- Solo muestra ubicación en mapa
- No tiene sistema de reservas
- Botón "Cómo llegar" en lugar de "Reservar"
- Ideal para empresas que solo quieren mostrar su ubicación

## 🚀 Próximos Pasos

1. Iniciar el servidor: `npm start`
2. Acceder como admin: `admin@bookingmap.cl` / `admin123`
3. Agregar negocios PYME con horarios
4. Agregar empresas solo con ubicación
5. Registrar usuarios de prueba
6. Probar sistema de reservas
7. Dejar reseñas y comentarios

## ❓ Preguntas Frecuentes

**Q: ¿Por qué los archivos HTML son tan cortos?**
A: Es una arquitectura SPA. El JavaScript genera el contenido dinámicamente.

**Q: ¿Puedo usar MySQL en lugar de SQLite?**
A: Sí, pero debes modificar `config/basedatos.js` y los modelos para usar el driver de MySQL.

**Q: ¿Cómo agrego más categorías?**
A: Edita `database/inicializar.js` y agrega categorías al array, o insértalas directamente en la tabla `categorias`.

**Q: ¿El sistema soporta múltiples idiomas?**
A: Actualmente solo español. Puedes agregar i18n modificando los archivos JS y HTML.

**Q: ¿Hay límite de reservas por usuario?**
A: No por defecto. Puedes agregar validación en `ControladorReservas.js`.

## 📞 Soporte

Para problemas técnicos, revisa:
1. Logs del servidor en la consola
2. Consola del navegador (F12 → Console)
3. Estado de la base de datos con DBeaver
4. Este archivo de documentación

¡Disfruta BookingMap Chile! 🗺️✨
\`\`\`

\`\`\`js file="" isHidden
