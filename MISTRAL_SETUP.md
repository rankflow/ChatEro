# Configuración de Mistral para Chat Ero

## ¿Por qué Mistral?

Mistral es mucho mejor que OpenAI para contenido adulto porque:
- **No tiene filtros de censura** como OpenAI
- **Responde de forma natural y explícita** cuando se le pide
- **Puede hablar de sexo, BDSM, fetichismo** sin limitaciones artificiales
- **Es más barato** que OpenAI
- **Puedes ejecutarlo localmente** en tu propio servidor

## Configuración en Servidor Virtual Linux

### 1. Instalar Ollama

```bash
# Conectar a tu servidor virtual
ssh usuario@tu-servidor.com

# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Verificar instalación
ollama --version
```

### 2. Descargar y ejecutar Mistral

```bash
# Descargar Mistral 7B (versión recomendada)
ollama pull mistral:7b-instruct

# O si quieres una versión más potente
ollama pull mistral:7b-instruct-q4_K_M

# Ejecutar el servidor
ollama serve
```

### 3. Configurar como servicio (opcional)

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/ollama.service

# Contenido del archivo:
[Unit]
Description=Ollama AI Service
After=network.target

[Service]
Type=simple
User=tu-usuario
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Habilitar y iniciar el servicio
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

### 4. Configurar firewall

```bash
# Abrir puerto 11434 (puerto por defecto de Ollama)
sudo ufw allow 11434

# O si usas iptables
sudo iptables -A INPUT -p tcp --dport 11434 -j ACCEPT
```

### 5. Configurar tu aplicación

En tu archivo `.env` del backend:

```env
# Mistral (recomendado para contenido adulto)
MISTRAL_BASE_URL=http://IP-DE-TU-SERVIDOR:11434
MISTRAL_API_KEY=
MISTRAL_MODEL=mistral:7b-instruct
```

### 6. Probar la conexión

```bash
# Desde tu servidor
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral:7b-instruct",
    "messages": [{"role": "user", "content": "Hola, dime algo sexy"}],
    "stream": false
  }'

# Desde tu máquina local
curl -X POST http://IP-DE-TU-SERVIDOR:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral:7b-instruct",
    "messages": [{"role": "user", "content": "Hola, dime algo sexy"}],
    "stream": false
  }'
```

## Modelos recomendados

### Para contenido adulto:
- `mistral:7b-instruct` - Bueno y rápido
- `mistral:7b-instruct-q4_K_M` - Mejor calidad, más lento
- `llama2:7b-chat` - Alternativa buena
- `llama2:13b-chat` - Mejor calidad, requiere más RAM

### Para instalar otros modelos:
```bash
ollama pull llama2:7b-chat
ollama pull llama2:13b-chat
```

## Configuración avanzada

### Optimizar rendimiento:
```bash
# Usar GPU (si tienes NVIDIA)
export CUDA_VISIBLE_DEVICES=0
ollama serve

# Configurar memoria
export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_ORIGINS=*
ollama serve
```

### Configurar proxy reverso (recomendado):
```bash
# Instalar nginx
sudo apt install nginx

# Configurar nginx
sudo nano /etc/nginx/sites-available/ollama

# Contenido:
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/ollama /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Solución de problemas

### Error de conexión:
```bash
# Verificar que Ollama esté corriendo
ps aux | grep ollama

# Verificar puerto
netstat -tlnp | grep 11434

# Verificar logs
sudo journalctl -u ollama -f
```

### Error de memoria:
```bash
# Usar modelo más pequeño
ollama pull mistral:7b-instruct-q4_K_S

# O liberar memoria
sudo systemctl restart ollama
```

### Error de permisos:
```bash
# Dar permisos al usuario
sudo chown -R tu-usuario:tu-usuario ~/.ollama
```

## Ventajas de usar Mistral

1. **Sin censura**: Responde de forma natural y explícita
2. **Más barato**: No pagas por token como OpenAI
3. **Privacidad**: Todo se ejecuta en tu servidor
4. **Control total**: Puedes modificar el modelo como quieras
5. **Mejor para contenido adulto**: Diseñado para ser menos restrictivo

## Próximos pasos

1. Configura tu servidor virtual con Ollama
2. Actualiza tu `.env` con la IP del servidor
3. Reinicia tu backend
4. ¡Prueba el chat con contenido explícito!

El resultado será mucho más natural y explícito que con OpenAI. 🎉 