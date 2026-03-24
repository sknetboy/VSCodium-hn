# VSCodium Local AI Assistant (Open Source)

Proyecto completo (extensión + backend local) para VSCodium con:

- Chat lateral tipo Copilot Chat
- Edición de código con IA
- Inline code completion
- Backend desacoplado en Node.js/TypeScript
- PostgreSQL para persistencia real
- Integración con NVIDIA Triton Inference Server (con fallback local)

## Arquitectura

Se usa un enfoque de **arquitectura limpia/hexagonal simplificada**:

- **Extension (adaptador UI/editor):** webview, comandos, keybindings e integración con editor.
- **Backend API (adaptador HTTP):** expone `/chat` y `/completion`.
- **Servicios de dominio/aplicación:** `ChatService`, `CompletionService`, `ConversationService`.
- **Infraestructura:** PostgreSQL (`MessageRepository`) y cliente Triton (`triton_client.ts`).

## Estructura

```text
.
├── extension/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── extension.ts
│       ├── httpClient.ts
│       └── webview/
│           └── chatHtml.ts
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── config/
│   │   └── init.sql
│   └── src/
│       ├── main.ts
│       ├── config.ts
│       ├── controllers/
│       │   ├── chatController.ts
│       │   └── completionController.ts
│       ├── services/
│       │   ├── chatService.ts
│       │   ├── completionService.ts
│       │   ├── conversationService.ts
│       │   └── fallbackModel.ts
│       ├── db/
│       │   ├── migrations.ts
│       │   ├── messageRepository.ts
│       │   └── postgres.ts
│       ├── triton/
│       │   └── triton_client.ts
│       ├── domain/
│       │   └── types.ts
│       └── utils/
│           └── logger.ts
└── README.md
```

## Requisitos

- Node.js 20+
- npm
- PostgreSQL 14+
- VSCodium
- (Opcional) NVIDIA Triton Inference Server

## Configuración

### 1) Base de datos PostgreSQL

Crear base de datos, por ejemplo:

```sql
CREATE DATABASE local_ai;
```

Las tablas se crean automáticamente al iniciar el backend (`runMigrations`), pero también puedes usar:

```bash
psql postgresql://postgres:postgres@localhost:5432/local_ai -f backend/config/init.sql
```

### 2) Variables de entorno backend

```bash
cd backend
cp .env.example .env
```

Variables:

- `DATABASE_URL`
- `TRITON_URL`
- `MODEL_NAME`
- `PORT`

## Ejecución paso a paso

### A. Instalar dependencias

```bash
cd backend && npm install
cd ../extension && npm install
```

### B. Compilar

```bash
cd backend && npm run build
cd ../extension && npm run build
```

### C. Correr backend

```bash
cd backend
npm run dev
```

Backend disponible en `http://127.0.0.1:4000`.

### D. Abrir extensión en modo desarrollo

1. Abrir carpeta del proyecto en VSCodium.
2. Ir a carpeta `extension/` como workspace raíz o multi-root.
3. Presionar `F5` para abrir **Extension Development Host**.
4. Ejecutar comando `Open AI Assistant` desde Command Palette.

## Uso

- **Ctrl+U** → abre chat IA (`Open AI Assistant`).
- **Ctrl+I** → aplica edición IA al texto seleccionado.
- **Inline completion** → al escribir en el editor, la extensión solicita sugerencias a `/completion`.

## Endpoints backend

### `POST /chat`

Body:

```json
{ "message": "Explícame esta función" }
```

Respuesta:

```json
{ "reply": "...", "usedFallback": false }
```

### `POST /completion`

Body:

```json
{ "prefix": "function sum(a, b) {", "suffix": "}" }
```

Respuesta:

```json
{ "completion": "...", "usedFallback": true }
```

### `POST /model`

Permite cambiar dinámicamente el modelo Triton:

```json
{ "model": "nuevo-modelo" }
```

## Integración NVIDIA Triton

Archivo clave: `backend/src/triton/triton_client.ts`.

Funcionalidades implementadas:

- Detección de disponibilidad de Triton (`/v2/health/live`)
- Inferencia con modelo configurable (`/v2/models/{model}/infer`)
- Cambio de modelo en runtime (`setModel` y endpoint `/model`)
- Manejo robusto de errores con fallback local

## Fallback local

Si Triton no está disponible o falla:

- `/chat` responde con un texto local informativo.
- `/completion` devuelve una finalización base utilizable.

Esto permite operación 100% local sin dependencias cloud obligatorias.

## Verificar persistencia en PostgreSQL

Tras usar chat/completion:

```bash
psql postgresql://postgres:postgres@localhost:5432/local_ai
```

```sql
SELECT id, role, content, timestamp
FROM messages
ORDER BY timestamp DESC
LIMIT 10;
```

## Logging y errores

- Logging básico por nivel (`INFO`, `WARN`, `ERROR`) en `logger.ts`.
- Middleware global de errores en Express.
- Validación de payloads en controladores.

## Escalabilidad a multi-modelo

El diseño ya permite:

- seleccionar modelo activo por configuración (`MODEL_NAME`) o runtime (`/model`)
- extender `TritonClient` para varios backends/modelos
- agregar enrutamiento por tarea (`chat`, `completion`, etc.) sin tocar la extensión
