/**
 * Generate VCF Contact File & CSV for all 68 IUST Employees
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NKewaOp70Uix@ep-shiny-king-aosr4w3y-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function generateFiles() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT data FROM employees WHERE data->>'department' = 'Islamic University of Science and Technology' ORDER BY (data->>'id') ASC");
    const emps = res.rows.map(r => r.data);

    let vcfContent = '';
    let csvContent = 'ID,Name,Father Name,Mobile,Gender,Address,Photo Upload Link\n';

    emps.forEach((e, idx) => {
      const mobile = e.mobile ? e.mobile.replace(/\D/g, '') : '';
      const formattedPhone = mobile.length === 10 ? `+91${mobile}` : (mobile ? `+${mobile}` : '');
      const uploadLink = `https://valleysecurityserviceagency.in/upload-photo.html?id=${e.id}`;

      // VCF Entry
      if (formattedPhone) {
        vcfContent += `BEGIN:VCARD\nVERSION:3.0\nN:;IUST Guard ${e.name};;;\nFN:IUST Guard ${e.name}\nTEL;TYPE=CELL:${formattedPhone}\nNOTE:Employee ID: ${e.id} | Dept: IUST\nEND:VCARD\n\n`;
      }

      // CSV Entry
      csvContent += `"${e.id}","${e.name}","${e.fatherName || ''}","${formattedPhone}","${e.gender || ''}","${e.currentAddress || ''}","${uploadLink}"\n`;
    });

    const vcfPath = 'C:\\Users\\salim\\.gemini\\antigravity\\brain\\7dbd627f-6ee4-40d8-8e11-80bf7ab183a3\\IUST_Contacts.vcf';
    const csvPath = 'C:\\Users\\salim\\.gemini\\antigravity\\brain\\7dbd627f-6ee4-40d8-8e11-80bf7ab183a3\\IUST_Employees.csv';

    fs.writeFileSync(vcfPath, vcfContent, 'utf8');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    console.log('✅ Generated VCF:', vcfPath);
    console.log('✅ Generated CSV:', csvPath);
  } finally {
    client.release();
    await pool.end();
  }
}

generateFiles().catch(console.error);
