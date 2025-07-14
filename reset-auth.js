// Script para resetear autenticación
// Ejecuta esto en la consola del navegador (F12)

console.log('🔄 Reseteando autenticación...');

// Limpiar localStorage
localStorage.removeItem('authToken');
localStorage.removeItem('user');

console.log('✅ localStorage limpiado');

// Verificar que se limpió
console.log('🔍 Verificando limpieza:');
console.log('- Token:', localStorage.getItem('authToken') ? 'SÍ' : 'NO');
console.log('- Usuario:', localStorage.getItem('user') ? 'SÍ' : 'NO');

// Recargar la página
console.log('🔄 Recargando página...');
window.location.reload(); 