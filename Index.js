require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

// Modelo para la colección "Empleados"
const empleadoSchema = new mongoose.Schema({
  Clave: Number,
  Nombre: String,
  direccion: String,
  fechadenacimiento: Date,
  sexo: mongoose.Schema.Types.Mixed,
  tipodesangre: String
});

// Nombre exacto de la coleccion en MongoDB
const Empleado = mongoose.model(
  'Empleado',
  empleadoSchema,
  'Empleados'
);

// GET: Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.status(200).json(empleados);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// GET: Obtener un empleado por su Clave
app.get('/api/empleados/:clave', async (req, res) => {
  try {
    const clave = Number(req.params.clave);

    if (!Number.isFinite(clave)) {
      return res.status(400).json({
        mensaje: 'La Clave debe ser numérica'
      });
    }

    const empleado = await Empleado.findOne({ Clave: clave });

    if (!empleado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.status(200).json(empleado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// POST: Registrar un empleado
app.post('/api/empleados', async (req, res) => {
  try {
    const nuevoEmpleado = new Empleado(req.body);
    const guardado = await nuevoEmpleado.save();

    res.status(201).json(guardado);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'Ya existe un empleado con esa Clave'
      });
    }

    res.status(400).json({ mensaje: error.message });
  }
});

// PUT: Actualizar un empleado por su Clave
app.put('/api/empleados/:clave', async (req, res) => {
  try {
    const clave = Number(req.params.clave);

    if (!Number.isFinite(clave)) {
      return res.status(400).json({
        mensaje: 'La Clave debe ser numérica'
      });
    }

    // La Clave se conserva y no se puede cambiar desde el cuerpo
    const datos = { ...req.body };
    delete datos._id;
    delete datos.Clave;

    const actualizado = await Empleado.findOneAndUpdate(
      { Clave: clave },
      { $set: datos },
      {
        new: true,
        runValidators: true
      }
    );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.status(200).json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// DELETE: Eliminar un empleado por su Clave
app.delete('/api/empleados/:clave', async (req, res) => {
  try {
    const clave = Number(req.params.clave);

    if (!Number.isFinite(clave)) {
      return res.status(400).json({
        mensaje: 'La Clave debe ser numérica'
      });
    }

    const eliminado = await Empleado.findOneAndDelete({
      Clave: clave
    });

    if (!eliminado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Empleado eliminado correctamente',
      empleado: eliminado
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Ruta de bienvenida para comprobar que la API responde
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Empleados funcionando correctamente'
  });
});

// Puerto local o el asignado por el hosting
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});