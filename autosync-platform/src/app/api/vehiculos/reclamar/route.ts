import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/vehiculos/reclamar
// El dueño reclama un vehículo con patente + 3 dígitos del DNI
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debés iniciar sesión' }, { status: 401 })
    }
    if (user.rol !== 'DUENO') {
      return NextResponse.json({ error: 'Solo los dueños pueden reclamar vehículos' }, { status: 403 })
    }

    const body = await req.json()
    const { patente, codigoVerificacion, marca, modelo, anio, color, tipo, combustible, vin, numeroMotor } = body

    if (!patente || !codigoVerificacion) {
      return NextResponse.json({ error: 'Patente y código de verificación son obligatorios' }, { status: 400 })
    }

    const patenteNorm = patente.toUpperCase().trim().replace(/[^A-Z0-9]/g, '')
    if (patenteNorm.length < 6 || patenteNorm.length > 7) {
      return NextResponse.json({ error: 'Patente inválida' }, { status: 400 })
    }

    // Verificar si el vehículo ya existe
    let vehiculo = await db.vehiculo.findUnique({ where: { patente: patenteNorm } })

    if (vehiculo) {
      // Si ya tiene dueño
      if (vehiculo.ownerId) {
        if (vehiculo.ownerId === user.id) {
          return NextResponse.json({ error: 'Ya tenés este vehículo en tu cuenta' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Este vehículo ya fue reclamado por otro usuario' }, { status: 403 })
      }

      // Si no tiene dueño pero tiene código de verificación, validar
      if (vehiculo.codigoVerificacion && vehiculo.codigoVerificacion !== codigoVerificacion) {
        return NextResponse.json({ error: 'Código de verificación incorrecto' }, { status: 403 })
      }

      // Reclamar
      vehiculo = await db.vehiculo.update({
        where: { id: vehiculo.id },
        data: {
          ownerId: user.id,
          verificado: true,
          codigoVerificacion,
          marca: marca || vehiculo.marca,
          modelo: modelo || vehiculo.modelo,
          anio: anio || vehiculo.anio,
          color: color || vehiculo.color,
          tipo: tipo || vehiculo.tipo,
          combustible: combustible || vehiculo.combustible,
          vin: vin || vehiculo.vin,
          numeroMotor: numeroMotor || vehiculo.numeroMotor,
        },
      })
    } else {
      // Crear nuevo vehículo reclamado
      vehiculo = await db.vehiculo.create({
        data: {
          patente: patenteNorm,
          marca: marca || 'Desconocida',
          modelo: modelo || 'Desconocido',
          anio: anio || 2000,
          color: color || null,
          tipo: tipo || 'Auto',
          combustible: combustible || null,
          vin: vin || null,
          numeroMotor: numeroMotor || null,
          ownerId: user.id,
          verificado: true,
          codigoVerificacion,
        },
      })
    }

    return NextResponse.json({ vehiculo: { id: vehiculo.id, patente: vehiculo.patente, marca: vehiculo.marca, modelo: vehiculo.modelo } }, { status: 201 })
  } catch (error) {
    console.error('Error al reclamar vehículo:', error)
    return NextResponse.json({ error: 'No se pudo reclamar el vehículo' }, { status: 500 })
  }
}
