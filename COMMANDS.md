# Comandos para Iniciar la Aplicación

## Primeros pasos

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd backend-app-semillero
```

2. Crea el archivo `.env` con la siguiente configuración:

```
DATABASE_URL="postgresql://postgres:postgres@db:5432/mental_health_app"
JWT_SECRET="your-secret-key-change-in-production"
OPENAI_API_KEY="your-openai-api-key"
PORT=3000
```

3. Asegúrate de tener Docker y Docker Compose instalados.

## Ejecución con Docker

Para iniciar la aplicación completa con Docker:

```bash
docker-compose up -d
```

Este comando creará y ejecutará los contenedores necesarios (backend y PostgreSQL).

## Migraciones de Base de Datos

Para inicializar la base de datos:

```bash
docker-compose exec app npx prisma migrate dev
```

## Datos de Prueba

Para cargar datos de prueba:

```bash
docker-compose exec app npm run seed
```

## Desarrollo Local (sin Docker)

1. Instala las dependencias:

```bash
npm install
```

2. Configura la base de datos local y actualiza la variable `DATABASE_URL` en `.env`

3. Ejecuta las migraciones:

```bash
npx prisma migrate dev
```

4. Carga los datos de prueba:

```bash
npm run seed
```

5. Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

## Credenciales de Prueba

Usuarios:
- Correo: `usuario1@example.com`, Contraseña: `Contrasena123` (estado verde)
- Correo: `usuario2@example.com`, Contraseña: `Contrasena123` (estado amarillo)
- Correo: `usuario3@example.com`, Contraseña: `Contrasena123` (estado rojo)

Psicólogos:
- Correo: `psicologo1@example.com`
- Correo: `psicologo2@example.com`

## Verificar que todo funciona correctamente

Puedes verificar que la API está funcionando con:

```bash
curl http://localhost:3000/health
```

Deberías recibir una respuesta JSON: `{"status":"ok"}` 