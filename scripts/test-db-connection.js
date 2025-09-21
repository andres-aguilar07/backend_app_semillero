#!/usr/bin/env node

/**
 * Script para verificar la conexión a la base de datos
 * Uso: node scripts/test-db-connection.js
 */

const { Pool } = require('pg');
require('dotenv').config();

// Función para parsear DATABASE_URL o usar variables individuales
function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    console.log('Usando DATABASE_URL:', databaseUrl.replace(/:[^:]*@/, ':***@'));
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    };
  }
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mental_health_app',
  };
  
  console.log('Usando variables individuales:', {
    ...config,
    password: '***'
  });
  
  return config;
}

async function testConnection() {
  console.log('🔍 Verificando conexión a la base de datos...\n');
  
  const config = getDatabaseConfig();
  const pool = new Pool(config);
  
  try {
    // Intentar conectar
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!');
    
    // Ejecutar una consulta simple
    const result = await client.query('SELECT version()');
    console.log('📊 Versión de PostgreSQL:', result.rows[0].version);
    
    // Verificar si la base de datos tiene tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📋 Tablas encontradas:', tablesResult.rows.map(row => row.table_name).join(', '));
    } else {
      console.log('ℹ️  No se encontraron tablas en la base de datos');
    }
    
    client.release();
    console.log('\n🎉 ¡Prueba de conexión completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Sugerencias:');
    console.log('   - Verifica que PostgreSQL esté ejecutándose');
    console.log('   - Confirma las credenciales en el archivo .env');
    console.log('   - Asegúrate de que la base de datos existe');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   - El servidor de base de datos no está accesible');
    } else if (error.code === '28P01') {
      console.log('   - Error de autenticación (usuario/contraseña incorrectos)');
    } else if (error.code === '3D000') {
      console.log('   - La base de datos especificada no existe');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
