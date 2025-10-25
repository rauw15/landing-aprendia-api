const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Endpoint de salud (debe ir al principio)
app.get('/api/health', (req, res) => {
    console.log('🏥 Health check solicitado');
    res.json({
        success: true,
        message: 'API de AprendIA Chiapas funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
    });
});

// Conectar a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://223265:223265@cluster0.jkdr27b.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Modelo de Usuario
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    municipality: {
        type: String,
        required: [true, 'El municipio es obligatorio'],
        enum: ['tuxtla', 'san-cristobal', 'tapachula', 'palenque', 'comitan', 'otro']
    },
    education: {
        type: String,
        required: [true, 'El nivel educativo es obligatorio'],
        enum: ['primaria', 'secundaria', 'preparatoria', 'universidad', 'posgrado']
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

// Validaciones para el registro
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Debe ser un email válido'),
    body('municipality')
        .isIn(['tuxtla', 'san-cristobal', 'tapachula', 'palenque', 'comitan', 'otro'])
        .withMessage('Municipio no válido'),
    body('education')
        .isIn(['primaria', 'secundaria', 'preparatoria', 'universidad', 'posgrado'])
        .withMessage('Nivel educativo no válido')
];

// Endpoint de registro
app.post('/api/register', registerValidation, async (req, res) => {
    try {
        console.log('📝 Recibiendo registro:', req.body);
        
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Errores de validación:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { name, email, municipality, education } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('⚠️ Usuario ya existe:', email);
            return res.status(409).json({
                success: false,
                message: 'Este email ya está registrado en el programa'
            });
        }

        // Crear nuevo usuario
        const newUser = new User({
            name,
            email,
            municipality,
            education
        });

        await newUser.save();
        console.log('✅ Usuario registrado exitosamente:', newUser._id);

        res.status(201).json({
            success: true,
            message: 'Registro exitoso. ¡Bienvenido a AprendIA Chiapas!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                municipality: newUser.municipality,
                education: newUser.education,
                registrationDate: newUser.registrationDate
            }
        });

    } catch (error) {
        console.error('💥 Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
});

// Endpoint para obtener todos los usuarios (para testing)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({ status: 'active' }).select('-__v');
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo usuarios'
        });
    }
});

// Endpoint para obtener estadísticas
app.get('/api/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ status: 'active' });
        
        const usersByMunicipality = await User.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$municipality', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const usersByEducation = await User.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$education', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                usersByMunicipality,
                usersByEducation
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas'
        });
    }
});


// Endpoint de raíz
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de AprendIA Chiapas funcionando correctamente',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            register: '/api/register',
            users: '/api/users',
            stats: '/api/stats'
        },
        documentation: 'https://github.com/tu-repo/aprendia-chiapas',
        timestamp: new Date().toISOString()
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        availableEndpoints: [
            'GET /',
            'GET /api/health',
            'POST /api/register',
            'GET /api/users',
            'GET /api/stats'
        ],
        requestedPath: req.originalUrl
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Usuarios: http://localhost:${PORT}/api/users`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;