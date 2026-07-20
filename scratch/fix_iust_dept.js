const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NKewaOp70Uix@ep-shiny-king-aosr4w3y-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const ids = [
  'VSA-1177','VSA-1178','VSA-1179','VSA-1180','VSA-1181',
  'VSA-1182','VSA-1183','VSA-1184','VSA-1185','VSA-1186',
  'VSA-1187','VSA-1188','VSA-1189','VSA-1190','VSA-1191',
  'VSA-1192','VSA-1193','VSA-1194','VSA-1195','VSA-1196'
];

const CORRECT_DEPT = 'Islamic University of Science and Technology';

async function fix() {
  const client = await pool.connect();
  try {
    for (const id of ids) {
      const res = await client.query('SELECT data FROM employees WHERE id = $1', [id]);
      if (!res.rows.length) { console.log(id + ': NOT FOUND'); continue; }
      const emp = res.rows[0].data;
      emp.department = CORRECT_DEPT;
      emp.updatedAt = new Date().toISOString();
      await client.query('UPDATE employees SET data = $1 WHERE id = $2', [JSON.stringify(emp), id]);
      console.log('✅ ' + id + ' - ' + emp.name + ' → department = "' + CORRECT_DEPT + '"');
    }
    console.log('\nAll done!');
  } finally {
    client.release();
    await pool.end();
  }
}

fix().catch(console.error);
