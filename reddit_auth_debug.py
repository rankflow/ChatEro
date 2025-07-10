#!/usr/bin/env python3
"""
Script de prueba para verificar autenticación con Reddit API usando PRAW
"""

import praw

def test_reddit_auth():
    """Prueba la autenticación con Reddit API"""
    print("🔐 Probando autenticación con Reddit API...")
    print("=" * 50)
    
    try:
        reddit = praw.Reddit(
            client_id="vQ2Mbl3oxknHLqNCR_tIWQ",
            client_secret="u0z2oWsM8_NGfhv47thju3Rm2ByfSA",
            username="pericopako",
            password="masencoa12",
            user_agent="ChatEroScraper/0.1 by pericopako"
        )
        
        # Verificar si la autenticación fue exitosa
        if reddit.user.me():
            print("✅ Login exitoso!")
            print(f"👤 Usuario autenticado: {reddit.user.me()}")
            print(f"🔑 Client ID: {reddit.config.client_id}")
            print(f"🌐 User Agent: {reddit.config.user_agent}")
            
            # Probar acceso a un subreddit
            try:
                subreddit = reddit.subreddit("test")
                print("✅ Acceso a subreddits: OK")
            except Exception as sub_error:
                print(f"⚠️  Acceso a subreddits: {sub_error}")
                
        else:
            print("❌ Login falló - No se pudo obtener información del usuario")
            
    except Exception as e:
        print("❌ Error autenticando con Reddit API:")
        print(f"   Error: {str(e)}")
        print(f"   Tipo: {type(e).__name__}")
        
        # Información adicional para debugging
        print("\n🔍 Información de debugging:")
        print("   - Verifica que las credenciales sean correctas")
        print("   - Asegúrate de que la app esté configurada como 'script' en Reddit")
        print("   - Revisa que el username y password sean válidos")

if __name__ == "__main__":
    test_reddit_auth() 