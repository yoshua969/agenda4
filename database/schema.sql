-- ============================================
-- ESQUEMA COMPLETO DE BASE DE DATOS SQLITE
-- BookingMap Chile
-- ============================================

-- Habilitar claves foráneas
PRAGMA foreign_keys = ON;

-- ============================================
-- TABLA: usuarios
-- Almacena información de usuarios y administradores
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  contraseña TEXT NOT NULL,
  rol TEXT DEFAULT 'usuario' CHECK(rol IN ('usuario', 'admin')),
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: categorias
-- Define las categorías de negocios disponibles
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  icono TEXT,
  color TEXT,
  descripcion TEXT
);

-- ============================================
-- TABLA: negocios
-- Almacena PYMEs y Empresas registradas
-- ============================================
CREATE TABLE IF NOT EXISTS negocios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  direccion TEXT NOT NULL,
  latitud REAL NOT NULL,
  longitud REAL NOT NULL,
  telefono TEXT,
  tipo_negocio TEXT DEFAULT 'pyme' CHECK(tipo_negocio IN ('pyme', 'empresa')),
  tipo TEXT DEFAULT 'reservable' CHECK(tipo IN ('reservable', 'solo-info')),
  id_propietario INTEGER,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_propietario) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (categoria) REFERENCES categorias(codigo) ON DELETE RESTRICT
);

-- ============================================
-- TABLA: horarios_negocio
-- Define los horarios de atención por día
-- Solo aplica para PYMEs con tipo 'reservable'
-- ============================================
CREATE TABLE IF NOT EXISTS horarios_negocio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_negocio INTEGER NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_apertura TEXT NOT NULL,
  hora_cierre TEXT NOT NULL,
  intervalo_reserva INTEGER DEFAULT 30 CHECK (intervalo_reserva IN (15, 30, 45, 60)),
  FOREIGN KEY (id_negocio) REFERENCES negocios(id) ON DELETE CASCADE,
  UNIQUE (id_negocio, dia_semana)
);

-- ============================================
-- TABLA: servicios
-- Lista de servicios ofrecidos por cada negocio
-- ============================================
CREATE TABLE IF NOT EXISTS servicios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_negocio INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  duracion INTEGER DEFAULT 30,
  precio REAL,
  activo INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_negocio) REFERENCES negocios(id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: reservas
-- Reservas realizadas por usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_negocio INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  id_servicio INTEGER,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  servicio TEXT,
  notas TEXT,
  estado TEXT DEFAULT 'Confirmada' CHECK(estado IN ('Confirmada', 'Cancelada', 'Completada')),
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_cancelacion DATETIME,
  FOREIGN KEY (id_negocio) REFERENCES negocios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_servicio) REFERENCES servicios(id) ON DELETE SET NULL
);

-- Índice para búsqueda rápida de reservas por fecha
CREATE INDEX IF NOT EXISTS idx_reservas_fecha 
ON reservas(id_negocio, fecha, hora);

-- ============================================
-- TABLA: resenas
-- Comentarios y calificaciones de usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS resenas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_negocio INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  respuesta_admin TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta DATETIME,
  FOREIGN KEY (id_negocio) REFERENCES negocios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE (id_negocio, id_usuario)
);

-- ============================================
-- TABLA: notificaciones
-- Sistema de notificaciones para usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT DEFAULT 'info' CHECK(tipo IN ('info', 'reserva', 'cancelacion', 'recordatorio')),
  leido INTEGER DEFAULT 0,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: historial_cambios
-- Auditoría de cambios en el sistema
-- ============================================
CREATE TABLE IF NOT EXISTS historial_cambios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabla TEXT NOT NULL,
  id_registro INTEGER NOT NULL,
  accion TEXT NOT NULL CHECK(accion IN ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores TEXT,
  datos_nuevos TEXT,
  id_usuario INTEGER,
  fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar categorías predefinidas
INSERT OR IGNORE INTO categorias (codigo, nombre, icono, color, descripcion) VALUES
('beauty', 'Belleza', 'fas fa-cut', '#e91e63', 'Peluquerías, salones de belleza, spas'),
('health', 'Salud', 'fas fa-heartbeat', '#4caf50', 'Consultorios médicos, dentistas, fisioterapeutas'),
('automotive', 'Automotriz', 'fas fa-car', '#ff9800', 'Talleres mecánicos, lavado de autos'),
('shopping', 'Compras', 'fas fa-shopping-cart', '#9c27b0', 'Tiendas, comercio retail'),
('food', 'Comida', 'fas fa-utensils', '#f44336', 'Restaurantes, cafeterías');
