# 🧪 Pruebas con Postman - AprendIA API

## 📋 Configuración Inicial

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar MongoDB Atlas
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito
3. Crear usuario de base de datos
4. Configurar IP whitelist (0.0.0.0/0 para desarrollo)
5. Obtener connection string

### 3. Crear archivo .env
```bash
cp env.example .env
```

Editar `.env` con tu connection string:
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/aprendia
PORT=3000
```

### 4. Ejecutar servidor
```bash
npm run dev
```

## 🚀 Pruebas en Postman

### 1. Health Check
**GET** `http://localhost:3000/api/health`

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "API de AprendIA Chiapas funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "database": "Conectado"
}
```

### 2. Registrar Usuario
**POST** `http://localhost:3000/api/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "municipality": "tuxtla",
  "education": "universidad"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Registro exitoso. ¡Bienvenido a AprendIA Chiapas!",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "municipality": "tuxtla",
    "education": "universidad",
    "registrationDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Ver Todos los Usuarios
**GET** `http://localhost:3000/api/users`

**Respuesta:**
```json
{
  "success": true,
  "count": 1,
  "users": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "municipality": "tuxtla",
      "education": "universidad",
      "registrationDate": "2024-01-15T10:30:00.000Z",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 4. Obtener Estadísticas
**GET** `http://localhost:3000/api/stats`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1,
    "usersByMunicipality": [
      { "_id": "tuxtla", "count": 1 }
    ],
    "usersByEducation": [
      { "_id": "universidad", "count": 1 }
    ]
  }
}
```

## 🧪 Casos de Prueba

### Caso 1: Registro Exitoso
```json
{
  "name": "María González",
  "email": "maria@email.com",
  "municipality": "san-cristobal",
  "education": "preparatoria"
}
```

### Caso 2: Email Duplicado
```json
{
  "name": "Pedro López",
  "email": "juan@email.com",
  "municipality": "tapachula",
  "education": "secundaria"
}
```
**Respuesta esperada (409):**
```json
{
  "success": false,
  "message": "Este email ya está registrado en el programa"
}
```

### Caso 3: Datos Inválidos
```json
{
  "name": "A",
  "email": "email-invalido",
  "municipality": "municipio-inexistente",
  "education": "nivel-inexistente"
}
```
**Respuesta esperada (400):**
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "msg": "El nombre debe tener entre 2 y 100 caracteres",
      "param": "name",
      "location": "body"
    },
    {
      "msg": "Debe ser un email válido",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## 🔍 Verificar en MongoDB Atlas

1. Ir a tu cluster en MongoDB Atlas
2. Click en "Browse Collections"
3. Buscar la base de datos "aprendia"
4. Ver la colección "users"
5. Verificar que los datos se guardaron correctamente

## 🐛 Solución de Problemas

### Error de Conexión a MongoDB
- Verificar que el connection string sea correcto
- Verificar que la IP esté en la whitelist
- Verificar que el usuario tenga permisos

### Error 500 en el servidor
- Revisar los logs en la consola
- Verificar que todas las dependencias estén instaladas
- Verificar que el puerto 3000 esté disponible

### Datos no se guardan
- Verificar conexión a MongoDB
- Revisar logs del servidor
- Probar con un usuario simple primero

## 📊 Monitoreo

El servidor muestra logs detallados:
- ✅ Conexión exitosa a MongoDB
- 📝 Registros recibidos
- ❌ Errores de validación
- ✅ Usuarios registrados exitosamente
- 💥 Errores del servidor
