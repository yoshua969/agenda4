# Instrucciones de Uso - BookingMap Chile

## Para Usuarios

### Registro e Inicio de Sesión
1. Abre `http://localhost:3000`
2. Haz clic en "Registrarse"
3. Completa el formulario con tus datos
4. Inicia sesión con tu email y contraseña

### Buscar Negocios
1. Permite acceso a tu ubicación cuando el navegador lo solicite
2. Usa la barra de búsqueda para encontrar servicios
3. Filtra por categorías: Belleza, Salud, Automotriz, Compras, Comida
4. El mapa muestra tu ubicación (punto azul) y los negocios cercanos

### Realizar una Reserva
1. Haz clic en un negocio del mapa o de la lista
2. Presiona el botón "Reservar"
3. Selecciona fecha y hora disponible
4. Agrega notas si es necesario
5. Confirma tu reserva

### Gestionar tus Reservas
1. Ve a "Panel Usuario" desde el menú
2. Visualiza todas tus reservas activas
3. Puedes cancelar reservas si es necesario
4. Ver direcciones para llegar al negocio

### Dejar una Reseña
1. Haz clic en "Reseñas" en cualquier negocio
2. Si ya tienes una reserva completada, puedes dejar una reseña
3. Selecciona de 1 a 5 estrellas
4. Escribe un comentario (opcional)

## Para Administradores (PyMEs)

### Crear Cuenta de Administrador
La primera vez necesitas crear un usuario admin directamente en la base de datos:

\`\`\`sql
INSERT INTO usuarios (nombre, email, telefono, contraseña, rol) 
VALUES ('Admin', 'admin@ejemplo.com', '+56912345678', '$2b$10$...', 'admin');
\`\`\`

**Nota:** La contraseña debe estar encriptada con bcrypt.

### Registrar un Negocio

#### PYME (con sistema de reservas)
1. Inicia sesión como admin
2. Ve al "Panel Administrador"
3. Haz clic en "Agregar Negocio"
4. Completa el formulario:
   - Nombre del negocio
   - Descripción
   - Categoría
   - Dirección completa
   - Teléfono
   - **Tipo de negocio:** Selecciona "PYME"
   - **Tipo de sistema:** Selecciona "Reservable"
5. La ubicación (latitud/longitud) se obtiene automáticamente de la dirección

#### Empresa (solo información)
1. Mismo proceso que PYME
2. **Tipo de negocio:** Selecciona "Empresa"
3. **Tipo de sistema:** Selecciona "Solo información"

### Configurar Horarios de Trabajo (Solo PyMEs)

1. En el Panel Administrador, selecciona tu negocio
2. Haz clic en "Configurar Horarios"
3. Para cada día de la semana:
   - Marca si está abierto
   - Hora de apertura (ejemplo: 09:00)
   - Hora de cierre (ejemplo: 18:00)
   - Intervalo de reservas:
     * 15 minutos (4 reservas por hora)
     * 30 minutos (2 reservas por hora)
     * 45 minutos (1.33 reservas por hora)
     * 60 minutos (1 reserva por hora)
4. Guarda los cambios

**Ejemplo de Configuración:**
- Lunes a Viernes: 9:00 - 18:00 (intervalo 30 min)
- Sábado: 10:00 - 14:00 (intervalo 30 min)
- Domingo: Cerrado

### Gestionar Reservas

1. Ve a "Mis Negocios" en el Panel Administrador
2. Haz clic en "Ver Reservas"
3. Visualiza todas las reservas:
   - Confirmadas (color verde)
   - Canceladas (color rojo)
   - Completadas (color gris)
4. Puedes cambiar el estado de las reservas
5. Ver información del cliente (nombre, teléfono)

### Ver Reseñas y Calificaciones

1. Desde tu negocio, haz clic en "Ver Reseñas"
2. Visualiza todas las reseñas recibidas
3. Promedio de calificación visible
4. Como admin, puedes eliminar reseñas inapropiadas

## Casos de Uso

### Caso 1: Peluquería (PYME)
- **Tipo:** PYME Reservable
- **Horarios:** Lunes a Sábado, 9:00-19:00
- **Intervalo:** 30 minutos
- **Servicios:** Corte, Tinte, Peinado
- Los clientes reservan horarios específicos
- La peluquería gestiona su agenda

### Caso 2: Supermercado (Empresa)
- **Tipo:** Empresa Solo-información
- **Función:** Mostrar ubicación en el mapa
- **Información:** Dirección, teléfono, horarios
- Sin sistema de reservas
- Los usuarios solo ven la ubicación y pueden pedir direcciones

### Caso 3: Taller Mecánico (PYME)
- **Tipo:** PYME Reservable
- **Horarios:** Lunes a Viernes, 8:00-17:00
- **Intervalo:** 60 minutos (trabajos de 1 hora)
- **Servicios:** Revisión técnica, Mantención, Reparación
- Control de agenda diaria

## Preguntas Frecuentes

**¿Puedo tener múltiples negocios?**
Sí, un administrador puede gestionar varios negocios desde su cuenta.

**¿Qué pasa si un cliente no llega a su reserva?**
El administrador puede marcar la reserva como "Completada" o "Cancelada" manualmente.

**¿Los clientes pueden reservar fuera del horario?**
No, el sistema solo muestra horarios dentro de la configuración establecida.

**¿Se pueden solapar reservas?**
No, el sistema valida automáticamente que no haya dos reservas en el mismo horario.

**¿Puedo cambiar los intervalos de reserva?**
Sí, puedes modificar los horarios en cualquier momento desde la configuración.

**¿Las empresas pueden activar el sistema de reservas?**
Sí, pueden cambiar de "Solo-información" a "Reservable" en cualquier momento.

## Soporte

Para problemas técnicos o consultas, contactar al equipo de desarrollo.
