const mongoose = require('mongoose');
require('dotenv').config();

// Script para verificar conexión a MongoDB y crear datos de prueba
async function setupDatabase() {
    try {
        console.log('🔌 Conectando a MongoDB Atlas...');
        
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://223265:223265@cluster0.jkdr27b.mongodb.net/?appName=Cluster0';
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Conectado a MongoDB Atlas');
        
        // Verificar conexión
        const db = mongoose.connection;
        console.log(`📊 Base de datos: ${db.name}`);
        console.log(`🌐 Host: ${db.host}`);
        console.log(`🔌 Puerto: ${db.port}`);
        
        // Crear algunos datos de prueba
        const User = mongoose.model('User', new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            municipality: { type: String, required: true },
            education: { type: String, required: true },
            registrationDate: { type: Date, default: Date.now },
            status: { type: String, default: 'active' }
        }, { timestamps: true }));
        
        // Verificar si ya existen usuarios
        const userCount = await User.countDocuments();
        console.log(`👥 Usuarios existentes: ${userCount}`);
        
        if (userCount === 0) {
            console.log('📝 Creando datos de prueba...');
            
            const testUsers = [
                {
                    name: 'Juan Pérez',
                    email: 'juan@test.com',
                    municipality: 'tuxtla',
                    education: 'universidad'
                },
                {
                    name: 'María González',
                    email: 'maria@test.com',
                    municipality: 'san-cristobal',
                    education: 'preparatoria'
                },
                {
                    name: 'Carlos López',
                    email: 'carlos@test.com',
                    municipality: 'tapachula',
                    education: 'secundaria'
                }
            ];
            
            await User.insertMany(testUsers);
            console.log('✅ Datos de prueba creados exitosamente');
        } else {
            console.log('ℹ️ Ya existen usuarios en la base de datos');
        }
        
        // Mostrar estadísticas
        const stats = await User.aggregate([
            { $group: { _id: '$municipality', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('📊 Estadísticas por municipio:');
        stats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} usuarios`);
        });
        
        console.log('🎉 Setup completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en setup:', error.message);
        console.error('💡 Verifica tu connection string en el archivo .env');
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar setup
setupDatabase();
