// Servicio de consulta y registro de envíos
// Taller final - Programación de Redes (CIAF)
const express = require('express');
const cors = require('cors');

// ⚠️ CAMBIEN ESTE VALOR por el N de su equipo
const N = 20;
const HEADER_ESPERADO = `CIAF-${N}`;
const PORT = 3000;
const ORIGEN_PERMITIDO = 'http://localhost:5500';

const app = express();

// 1) CORS: solo se permite el origen definido por el equipo
app.use(cors({
  origin: ORIGEN_PERMITIDO,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Red-Equipo'],
  exposedHeaders: ['X-Servidor-Procesado']
}));

// 2) Leer cuerpos JSON
app.use(express.json());

// 3) Middleware de validación del encabezado X-Red-Equipo
function validarEquipo(req, res, next) {
  const valor = req.get('X-Red-Equipo');

  if (!valor) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Falta el encabezado obligatorio X-Red-Equipo'
    });
  }
  if (valor !== HEADER_ESPERADO) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: `El valor '${valor}' del encabezado X-Red-Equipo no es válido`
    });
  }

  // Encabezado de respuesta personalizado en las respuestas exitosas
  res.set('X-Servidor-Procesado', `Equipo-${N}`);
  next();
}

app.use('/api', validarEquipo);

// "Base de datos" en memoria
const envios = [
  { guia: 'ENV-001', destino: 'Pereira', estado: 'En tránsito' },
  { guia: 'ENV-002', destino: 'Medellín', estado: 'Entregado' }
];

// GET /api/recurso -> consultar envíos
app.get('/api/recurso', (req, res) => {
  res.status(200).json({ total: envios.length, envios });
});

// POST /api/recurso -> registrar un envío
app.post('/api/recurso', (req, res) => {
  const { guia, destino, estado } = req.body || {};
  if (!guia || !destino) {
    return res.status(400).json({
      error: 'Datos incompletos',
      mensaje: 'Los campos guia y destino son obligatorios'
    });
  }
  const nuevo = { guia, destino, estado: estado || 'Registrado' };
  envios.push(nuevo);
  res.status(201).json({ mensaje: 'Envío registrado', envio: nuevo });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Header esperado: X-Red-Equipo: ${HEADER_ESPERADO}`);
});
