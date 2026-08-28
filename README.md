<div align="center">
  <h1>🚗 RPM - Tienda Online de Repuestos de Autos</h1>
  <p><strong>Backend API para la plataforma e-commerce de repuestos automotrices con asistencia de IA</strong></p>

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-13AA52?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
</div>

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Guía de Ejecución](#guía-de-ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Variables de Entorno](#variables-de-entorno)
- [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🎯 Descripción del Proyecto

**RPM** es una plataforma de comercio electrónico especializada en la venta de repuestos automotrices. El backend proporciona todos los servicios necesarios para gestionar:

- 🛒 **Catálogo de productos y proveedores**
- 👥 **Gestión de usuarios y cuentas**
- 📦 **Sistema de órdenes y compras**
- 🤖 **Integración con IA para búsqueda inteligente de repuestos**
- 📞 **Asistente virtual para agendar citas en sucursales**

---

## ✨ Características Principales

### 🤖 Asistente de IA para Búsqueda de Repuestos

- Búsqueda **sin necesidad de lenguaje técnico**
- El cliente describe su problema en palabras simples
- La IA identifica automáticamente el repuesto necesario
- Muestra sugerencias de productos relevantes
- **Ejemplo:** "Mi auto no frena bien" → Propone pastillas de freno, discos, cilindros maestros

### 📱 Asistente de Llamadas por IA

- Agende citas **de forma automática**
- Asistente de voz que entiende el lenguaje natural
- Consulta disponibilidad en tiempo real
- Confirma citas sin intervención humana
- Integración con calendario de sucursales

### 🏬 Gestión de Tienda Online

- Catálogo completo de repuestos automotrices
- Gestión de proveedores y sus productos
- Sistema de órdenes y carrito de compras
- Información de contacto y ubicación de sucursales

### 🔐 Seguridad y Validación

- Validación de datos en todos los endpoints
- Autenticación de usuarios
- CORS habilitado para desarrollo

---

## 🛠️ Tecnologías Utilizadas

<div align="center">

| Tecnología                                                                                      | Versión | Descripción                              |
| ----------------------------------------------------------------------------------------------- | ------- | ---------------------------------------- |
| ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs)             | Latest  | Framework backend progresivo y escalable |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript) | Latest  | Lenguaje tipado para mayor seguridad     |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js)          | 18+     | Runtime de JavaScript                    |
| ![MongoDB](https://img.shields.io/badge/MongoDB-13AA52?style=flat-square&logo=mongodb)          | Latest  | Base de datos NoSQL                      |
| ![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=flat-square&logo=mongoose)       | Latest  | ODM para MongoDB                         |

</div>

### Stack Completo:

- **Backend:** NestJS + TypeScript
- **Runtime:** Node.js
- **Base de Datos:** MongoDB
- **Validación:** class-validator, class-transformer
- **ORM:** Mongoose

---

## 📦 Instalación

### Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- MongoDB instalado o acceso a MongoDB Atlas
- Git

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone <URL_DEL_REPOSITORIO>
cd RPM/backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

---

## 🚀 Guía de Ejecución

### Modo Desarrollo

Ejecuta la aplicación en modo observador (hot-reload):

```bash
npm run start:dev
```

### Modo Producción

Compila y ejecuta la aplicación:

```bash
npm run build
npm run start:prod
```

### Modo Normal

```bash
npm run start
```

La API estará disponible en: `http://localhost:3000`

---

## 📂 Estructura del Proyecto

```
src/
├── main.ts                 # Punto de entrada de la aplicación
├── app.module.ts          # Módulo raíz
├── users/                 # Módulo de usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
│       ├── user.dto.ts
│       └── address.dto.ts
├── suppliers/             # Módulo de proveedores
│   ├── suppliers.controller.ts
│   ├── suppliers.service.ts
│   ├── suppliers.module.ts
│   └── dto/
│       ├── supplier.dto.ts
│       └── product.dto.ts
├── orders/                # Módulo de órdenes
│   └── dto/
│       ├── order.dto.ts
│       └── detailOrder.dto.ts
└── schemas/               # Esquemas de MongoDB
    ├── userSchema.ts
    ├── addressSchema.ts
    ├── supplierSchema.ts
    ├── productSchema.ts
    ├── orderSchema.ts
    └── detailSchema.ts
```

Para más detalles sobre la estructura, consulta [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)

---

## 🌐 API Endpoints

### 👥 Usuarios

```
GET    /users           # Obtener todos los usuarios
POST   /users           # Crear nuevo usuario
PATCH  /users/:id       # Actualizar usuario
DELETE /users           # Eliminar usuarios
```

### 🏢 Proveedores

```
POST   /suppliers       # Crear proveedor
```

### 📦 Órdenes

```
(En desarrollo)
```

---

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Puerto
PORT=3000

# Base de Datos MongoDB
URL_MONGOODB=mongodb://localhost:27017/rpm
# O para MongoDB Atlas:
# URL_MONGOODB=mongodb+srv://<usuario>:<contraseña>@cluster.mongodb.net/rpm

# Ambiente
NODE_ENV=development

# IA y Servicios (Próximas fases)
OPENAI_API_KEY=your_api_key_here
TWILIO_API_KEY=your_twilio_key_here
```

---

## 💻 Guía de Desarrollo

### Agregar una Nueva Funcionalidad

1. **Crear DTOs** para validación en `/dto`
2. **Crear Schema** en `/schemas` si es una entidad nueva
3. **Crear Servicio** con la lógica de negocio
4. **Crear Controlador** con las rutas HTTP
5. **Crear Módulo** que integre todo
6. **Importar Módulo** en `app.module.ts`

### Convenciones de Código

- ✅ Usar TypeScript en lugar de JavaScript
- ✅ Seguir la arquitectura modular de NestJS
- ✅ Crear DTOs para todas las rutas POST/PATCH
- ✅ Incluir comentarios explicativos en funciones complejas
- ✅ Mantener los servicios como única fuente de lógica de negocio

### Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 🚀 Próximas Fases

- [ ] Integración con OpenAI para asistente de búsqueda
- [ ] Sistema de autenticación JWT
- [ ] Integración con Twilio para asistente de llamadas
- [ ] Sistema de pagos
- [ ] Notificaciones por email
- [ ] Dashboard administrativo

---

## 📚 Recursos Útiles

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Mongoose](https://mongoosejs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

---

## 👥 Equipo de Desarrollo

Proyecto desarrollado con ❤️ para mejorar la experiencia de compra de repuestos automotrices.

---

<div align="center">
  <p><strong>¿Preguntas?</strong> Consulta la <a href="./ESTRUCTURA_PROYECTO.md">guía de estructura</a> o contacta al equipo de desarrollo.</p>
</div>
