# Gutenberg Scraper - Erotic Fiction

Script de Python para descargar legalmente libros de Project Gutenberg de la categoría "Erotic Fiction".

## Instalación

```bash
pip install -r requirements.txt
```

## Uso

```bash
python gutenberg_scraper.py
```

## Características

- ✅ Descarga legal y segura de libros del dominio público
- ✅ Respeta el servidor con delays y user-agent apropiado
- ✅ Prioriza archivos .txt, usa .html como alternativa
- ✅ Guarda archivos en carpeta `./Inspiration`
- ✅ Evita descargas duplicadas
- ✅ Manejo de errores robusto

## Estructura de archivos

```
Inspiration/
├── gutenberg_12345.txt
├── gutenberg_67890.html
└── ...
```

## Notas legales

- Todos los libros descargados son de dominio público
- El script respeta robots.txt y términos de uso
- Uso educativo y de investigación únicamente 