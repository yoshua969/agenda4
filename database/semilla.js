// Script para agregar datos de ejemplo a la base de datos
const bcrypt = require("bcrypt")
const { bd, obtenerConexion } = require("../config/basedatos")

async function sembrarDatos() {
  try {
    await obtenerConexion()

    console.log("🌱 Sembrando datos de ejemplo...")

    // Crear usuario administrador de ejemplo
    const contraseñaHasheada = await bcrypt.hash("admin123", 10)

    await bd.run(
      `
      INSERT OR IGNORE INTO usuarios (id, nombre, email, telefono, contraseña, rol)
      VALUES (1, 'Administrador', 'admin@bookingmap.cl', '+56912345678', ?, 'admin')
    `,
      [contraseñaHasheada],
    )

    // Crear usuario regular de ejemplo
    const contraseñaUsuario = await bcrypt.hash("usuario123", 10)

    await bd.run(
      `
      INSERT OR IGNORE INTO usuarios (id, nombre, email, telefono, contraseña, rol)
      VALUES (2, 'Juan Pérez', 'juan@email.com', '+56987654321', ?, 'usuario')
    `,
      [contraseñaUsuario],
    )

    // Crear PYME de ejemplo (Peluquería)
    await bd.run(`
      INSERT OR IGNORE INTO negocios (id, nombre, descripcion, categoria, direccion, latitud, longitud, telefono, tipo_negocio, tipo, id_propietario)
      VALUES (
        1,
        'Peluquería Estilo',
        'Peluquería profesional con más de 10 años de experiencia',
        'beauty',
        'Av. Providencia 123, Santiago',
        -33.4372,
        -70.6506,
        '+56922334455',
        'pyme',
        'reservable',
        1
      )
    `)

    // Horarios para la peluquería (Lunes a Viernes)
    for (let dia = 1; dia <= 5; dia++) {
      await bd.run(
        `
        INSERT OR IGNORE INTO horarios_negocio (id_negocio, dia_semana, hora_apertura, hora_cierre, intervalo_reserva)
        VALUES (1, ?, '09:00', '18:00', 30)
      `,
        [dia],
      )
    }

    // Crear Empresa de ejemplo (solo información)
    await bd.run(`
      INSERT OR IGNORE INTO negocios (id, nombre, descripcion, categoria, direccion, latitud, longitud, telefono, tipo_negocio, tipo, id_propietario)
      VALUES (
        2,
        'Farmacia Salud Total',
        'Cadena de farmacias con amplia variedad de productos',
        'health',
        'Av. Libertador Bernardo O Higgins 500, Santiago',
        -33.4450,
        -70.6570,
        '+56923456789',
        'empresa',
        'solo-info',
        1
      )
    `)

    // Crear servicios para la peluquería
    await bd.run(`
      INSERT OR IGNORE INTO servicios (id_negocio, nombre, descripcion, duracion, precio)
      VALUES 
        (1, 'Corte de Cabello', 'Corte profesional para hombre o mujer', 30, 15000),
        (1, 'Peinado', 'Peinado para eventos especiales', 45, 25000),
        (1, 'Tintura', 'Tintura completa con productos de calidad', 60, 35000)
    `)

    console.log("✅ Datos de ejemplo agregados correctamente")
    console.log("\n📝 Credenciales de prueba:")
    console.log("   Admin: admin@bookingmap.cl / admin123")
    console.log("   Usuario: juan@email.com / usuario123\n")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error sembrando datos:", error)
    process.exit(1)
  }
}

sembrarDatos()
