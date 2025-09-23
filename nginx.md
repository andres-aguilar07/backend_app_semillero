# Configuración de Nginx - Proxy Reverso y SSL

## Descripción General

Este documento explica la configuración de Nginx implementada en el proyecto, que actúa como un proxy reverso con soporte SSL/TLS, limitación de velocidad y medidas de seguridad avanzadas.

## Arquitectura del Sistema

El sistema utiliza Nginx como punto de entrada principal que:
- Recibe todas las peticiones HTTP/HTTPS del cliente
- Redirige automáticamente el tráfico HTTP a HTTPS
- Actúa como proxy reverso hacia la aplicación backend
- Proporciona terminación SSL/TLS
- Implementa medidas de seguridad y optimización

## Configuraciones Principales

### 1. Redirección HTTP a HTTPS

La configuración incluye un servidor que escucha en el puerto 80 (HTTP) y automáticamente redirige todo el tráfico al puerto 443 (HTTPS). Esto garantiza que todas las comunicaciones sean seguras.

### 2. Configuración SSL/TLS

El servidor HTTPS está configurado con:
- **Protocolos**: TLSv1.2 y TLSv1.3 (versiones más seguras)
- **Cifrado**: Algoritmos modernos y seguros (ECDHE-RSA-AES)
- **Caché de sesión**: Optimización del rendimiento SSL
- **Certificados**: Ubicados en `/etc/nginx/ssl/`

### 3. Cabeceras de Seguridad

Se implementan múltiples cabeceras de seguridad:
- **X-Frame-Options**: Previene ataques de clickjacking
- **X-Content-Type-Options**: Evita el sniffing de MIME types
- **X-XSS-Protection**: Protección contra ataques XSS
- **Strict-Transport-Security**: Fuerza el uso de HTTPS

### 4. Limitación de Velocidad (Rate Limiting)

- **Zona de limitación**: 10MB de memoria para rastrear IPs
- **Velocidad**: Máximo 10 peticiones por segundo por IP
- **Ráfagas**: Permite hasta 20 peticiones en ráfaga
- **Ámbito**: Aplicado específicamente a rutas `/api/`

### 5. Compresión Gzip

Habilitada para optimizar el ancho de banda:
- Compresión automática de contenido texto, JSON, JavaScript y CSS
- Reduce significativamente el tamaño de las respuestas

### 6. Configuración de Proxy

#### Rutas de API (`/api/`)
- **Balanceador**: Dirigido al upstream "backend" (app:3000)
- **Timeouts**: 60 segundos para conexión, envío y lectura
- **Headers**: Preserva información del cliente original
- **Rate limiting**: Aplicado específicamente a estas rutas

#### WebSockets (`/socket.io/`)
- **Upgrade de protocolo**: Soporte completo para WebSocket
- **Conexión persistente**: Mantiene conexiones en tiempo real
- **Headers adecuados**: Configuración específica para WebSockets

#### Health Check (`/health`)
- **Endpoint de monitoreo**: Verificación del estado del servicio
- **Configuración simplificada**: Sin rate limiting para monitoreo

### 7. Manejo de CORS

Configuración específica para peticiones OPTIONS (preflight):
- **Origins**: Permite todos los orígenes (configuración de desarrollo)
- **Métodos**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Soporte para headers de autenticación y contenido
- **Cache**: 1728000 segundos (20 días) para peticiones preflight

### 8. Upstream Backend

- **Servidor de destino**: app:3000 (nombre del contenedor Docker)
- **Balanceeo**: Configuración simple para un solo servidor
- **Alta disponibilidad**: Preparado para múltiples instancias

## Integración con Docker

### Configuración del Contenedor Nginx

El servicio nginx en Docker Compose:
- **Imagen**: nginx:alpine (versión liviana)
- **Puertos expuestos**: 80 (HTTP) y 443 (HTTPS)
- **Volúmenes montados**:
  - Configuración: `./nginx.conf` → `/etc/nginx/nginx.conf`
  - Certificados SSL: `./ssl` → `/etc/nginx/ssl`
- **Red**: Conectado a `app-network` para comunicación interna

### Generación de Certificados SSL

Para generar los certificados SSL autofirmados necesarios, sigue estos pasos:

### Paso 1: Crear el directorio SSL

Primero, crea el directorio `ssl` en la **raíz del proyecto** (al mismo nivel que `docker-compose.yml`, `nginx.conf` y `package.json`) donde se almacenarán los certificados:

**Ubicación correcta:**
```
backend_app_semillero/
├── docker-compose.yml
├── nginx.conf
├── package.json
├── ssl/                    ← Crear aquí
│   ├── server.crt         ← Se generará automáticamente
│   └── server.key         ← Se generará automáticamente
└── src/
```

**Comandos para crear el directorio:**

**Windows (PowerShell):**
```powershell
if (!(Test-Path "ssl")) { New-Item -ItemType Directory -Path "ssl" }
```

**Linux/Mac:**
```bash
mkdir -p ssl
```

### Paso 2: Generar los certificados

Ejecuta el siguiente comando Docker:

```bash
docker run --rm -v "${PWD}/ssl:/certs" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/server.key -out /certs/server.crt -subj "/C=CO/ST=Atlantico/L=Barranquilla/O=Semillero_back/OU=IT/CN=localhost"
```

**Explicación del comando:**
- `docker run --rm`: Ejecuta y elimina el contenedor después de completar
- `-v "${PWD}/ssl:/certs"`: Monta el directorio local `ssl` en `/certs` del contenedor
- `alpine/openssl`: Imagen con OpenSSL preinstalado
- `req -x509 -nodes`: Genera un certificado autofirmado sin contraseña
- `-days 365`: Válido por un año
- `-newkey rsa:2048`: Crea una clave RSA de 2048 bits
- `-keyout` y `-out`: Especifica dónde guardar la clave privada y el certificado
- `-subj`: Información del certificado (personalizable según necesidades)

## Beneficios de la Configuración

### Seguridad
- Cifrado TLS moderno y seguro
- Protección contra ataques comunes (XSS, clickjacking)
- Limitación de velocidad para prevenir abuso
- Redirección automática a HTTPS

### Rendimiento
- Compresión gzip para reducir ancho de banda
- Caché de sesiones SSL
- Configuración optimizada de timeouts
- Soporte para HTTP/2

### Escalabilidad
- Configuración de upstream preparada para múltiples instancias
- Balanceeo de carga básico implementado
- Separación clara entre frontend y backend

### Monitoreo
- Endpoint de health check dedicado
- Logs de acceso y errores de Nginx
- Páginas de error personalizables

## Consideraciones de Producción

1. **Certificados SSL**: En producción, reemplazar los certificados autofirmados por certificados válidos de una CA
2. **Configuración CORS**: Restringir los orígenes permitidos según el dominio de producción
3. **Rate Limiting**: Ajustar los límites según el tráfico esperado
4. **Logs**: Configurar rotación de logs y monitoreo centralizado
5. **Firewall**: Implementar reglas adicionales de firewall a nivel de infraestructura