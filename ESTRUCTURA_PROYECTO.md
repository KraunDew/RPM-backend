# 📁 Estructura del Proyecto Backend RPM

## 🎯 Descripción General

Este es un backend desarrollado con **NestJS** y **MongoDB** que gestiona usuarios, proveedores y órdenes.

---

## 📂 Estructura de Carpetas

### `/src/` - Código Fuente Principal

#### 📄 **main.ts**

- **Propósito:** Punto de entrada de la aplicación
- **Funciones:** Inicializa NestJS, configura validación global, habilita CORS
- **Puerto:** 3000 (configurable en .env)

#### 📄 **app.module.ts**

- **Propósito:** Módulo raíz que configura toda la aplicación
- **Responsabilidades:**
  - Conexión a MongoDB
  - Importación de módulos (Users, Suppliers)

---

## 📁 Módulos Principales

### 👥 **users/** - Gestión de Usuarios

| Archivo               | Descripción                                                 |
| --------------------- | ----------------------------------------------------------- |
| `users.controller.ts` | Rutas HTTP: GET, POST, PATCH, DELETE para usuarios          |
| `users.service.ts`    | Lógica de negocio: crear, actualizar, obtener usuarios      |
| `users.module.ts`     | Configura el módulo y conecta con MongoDB                   |
| `dto/user.dto.ts`     | Valida datos de entrada (email, contraseña, teléfono, etc.) |
| `dto/address.dto.ts`  | Valida datos de dirección (calle, ciudad, región, etc.)     |

**Funcionalidades:**

- ✅ Crear usuarios con validación de email único
- ✅ Obtener listado de todos los usuarios
- ✅ Actualizar información de usuario
- ✅ Eliminar usuarios
- ✅ Soporte para dirección y datos de contacto

---

### 🏢 **suppliers/** - Gestión de Proveedores

| Archivo                   | Descripción                                 |
| ------------------------- | ------------------------------------------- |
| `suppliers.controller.ts` | Rutas HTTP para operaciones con proveedores |
| `suppliers.service.ts`    | Lógica de negocio de proveedores            |
| `suppliers.module.ts`     | Configura el módulo de proveedores          |
| `dto/supplier.dto.ts`     | Valida datos del proveedor                  |
| `dto/product.dto.ts`      | Valida datos de productos ofrecidos         |

**Funcionalidades:**

- ✅ Crear proveedores con contacto (email, teléfono)
- ✅ Gestionar lista de productos por proveedor
- ✅ Incluir información de dirección

---

### 📦 **orders/** - Gestión de Órdenes

| Archivo                  | Descripción                                  |
| ------------------------ | -------------------------------------------- |
| `dto/order.dto.ts`       | Valida estructura de orden                   |
| `dto/detailOrder.dto.ts` | Valida detalles de cada producto en la orden |

**Campos:**

- `userId`: ID del usuario que realiza la orden
- `date`: Fecha de la orden
- `details`: Array de productos con cantidad

---

### 🗄️ **schemas/** - Esquemas de MongoDB

| Archivo             | Descripción                          |
| ------------------- | ------------------------------------ |
| `userSchema.ts`     | Estructura de datos de Usuario en BD |
| `addressSchema.ts`  | Sub-documento para direcciones       |
| `supplierSchema.ts` | Estructura de datos de Proveedor     |
| `productSchema.ts`  | Estructura de datos de Producto      |
| `orderSchema.ts`    | Estructura de datos de Orden         |
| `detailSchema.ts`   | Sub-documento para detalles de orden |

---

## 🔄 Flujo de una Solicitud HTTP

```
HTTP Request
    ↓
Controller (ej: users.controller.ts)
    ↓
DTO Validation (ej: user.dto.ts)
    ↓
Service (ej: users.service.ts)
    ↓
MongoDB via Mongoose Model
    ↓
HTTP Response
```

---

## 📋 Patrones Utilizados

### Data Transfer Object (DTO)

- Valida y transforma datos de entrada
- Ubicación: `/dto/` dentro de cada módulo
- Uso: `@Body() userData: UserDto`

### Schema

- Define la estructura de datos en MongoDB
- Ubicación: `/schemas/`
- Usa decoradores `@Prop()` de Mongoose

### Servicios

- Contienen la lógica de negocio
- Interactúan con la BD
- Reutilizables desde controladores

### Controladores

- Definen las rutas HTTP
- Reciben solicitudes y las delegan a servicios
- Devuelven respuestas al cliente

---

## 🛣️ Rutas Disponibles

### Usuarios

```
GET    /users          → Obtener todos los usuarios
POST   /users          → Crear nuevo usuario
PATCH  /users/:id      → Actualizar usuario
DELETE /users          → Eliminar usuarios
```

### Proveedores

```
POST   /suppliers      → Crear proveedor
```

---

## 📋 Validaciones Incluidas

### Usuario

- ✅ Email válido y único
- ✅ Contraseña fuerte
- ✅ Teléfono formato chileno (+569...)

### Proveedor

- ✅ Email válido
- ✅ Teléfono formato chileno
- ✅ Productos con precio positivo y stock válido

### Producto

- ✅ Precio debe ser positivo
- ✅ Stock debe ser mayor o igual a 0

---

## 🔐 Seguridad

- ✅ Validación global con `ValidationPipe`
- ✅ Whitelist de DTOs (solo campos permitidos)
- ✅ CORS habilitado para desarrollo
- ✅ Campos únicos: email y RUT de usuario

---

## 🚀 Cómo Agregar una Nueva Funcionalidad

1. **Crear DTOs** en `/dto/` para validación
2. **Crear Schema** en `/schemas/` si es una entidad nueva
3. **Crear Servicio** con la lógica de negocio
4. **Crear Controlador** con las rutas HTTP
5. **Crear Módulo** que integre todo
6. **Importar Módulo** en `app.module.ts`

---

## 📚 Tecnologías

- **NestJS**: Framework backend
- **TypeScript**: Lenguaje de tipado
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **class-validator**: Validación de datos
- **class-transformer**: Transformación de datos

---

## 💡 Consejos para Nuevos Desarrolladores

1. Siempre validar datos con DTOs
2. Los servicios contienen la lógica, no los controladores
3. Consultar esquemas para entender la estructura de datos
4. Revisar comentarios en archivos para entender cada componente
5. Seguir la estructura de carpetas establecida
