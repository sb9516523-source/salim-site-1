const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use DATABASE_URL from environment or local fallback
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Initialize database schema
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing PostgreSQL database...');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "fatherName" VARCHAR(255),
        dob DATE,
        gender VARCHAR(50),
        "bloodGroup" VARCHAR(10),
        "maritalStatus" VARCHAR(50),
        mobile VARCHAR(20),
        "altMobile" VARCHAR(20),
        email VARCHAR(255),
        "permanentAddress" TEXT,
        "currentAddress" TEXT,
        designation VARCHAR(255),
        department VARCHAR(255),
        "joinDate" DATE,
        salary DECIMAL(10, 2),
        status VARCHAR(50),
        documents JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        manager VARCHAR(255),
        contact VARCHAR(20),
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        layout VARCHAR(50),
        "headerText" VARCHAR(255),
        "subheaderText" VARCHAR(255),
        "headerBgColor" VARCHAR(10),
        "accentColor" VARCHAR(10),
        "textColor" VARCHAR(10),
        style VARCHAR(50),
        logo TEXT,
        background TEXT,
        signature TEXT,
        fields JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    // Load initial data from JSON
    const jsonDataPath = path.join(__dirname, 'db.json');
    if (fs.existsSync(jsonDataPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));

      // Insert employees
      if (jsonData.employees && jsonData.employees.length > 0) {
        for (const emp of jsonData.employees) {
          await pool.query(
            `INSERT INTO employees (id, name, "fatherName", designation, department, mobile, email, status, "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [emp.id, emp.name, emp.fatherName || '', emp.designation || '', emp.department || '', emp.mobile || emp.phone || '', emp.email || '', emp.status || 'active']
          );
        }
        console.log(`✅ Loaded ${jsonData.employees.length} employees`);
      }

      // Insert templates
      if (jsonData.templates && jsonData.templates.length > 0) {
        for (const tpl of jsonData.templates) {
          await pool.query(
            `INSERT INTO templates (id, name, layout, "headerBgColor", "accentColor", "textColor", "headerText", "subheaderText", fields)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [tpl.id, tpl.name, tpl.layout, tpl.headerBgColor, tpl.accentColor, tpl.textColor || '#000000', tpl.headerText || 'VALLEY SECURITY SERVICES', tpl.subheaderText || '', JSON.stringify(tpl.fields || {})]
          );
        }
        console.log(`✅ Loaded ${jsonData.templates.length} templates`);
      }
    }

    // Ensure default user exists
    await pool.query(
      `INSERT INTO users (email, password, name) 
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ['vllscrtservice@gmail.com', 'Salim@123', 'Admin User']
    );

    console.log('✅ Database initialized successfully');
    return true;
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    throw err;
  }
}

module.exports = { pool, initializeDatabase };
