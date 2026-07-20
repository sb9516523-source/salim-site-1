/**
 * Insert IUST Employees Script
 * ============================
 * Inserts all employees from the NEW IUST folder forms into the live Neon DB.
 * Department: Islamic University of Science and Technology (IUST) Awantipora
 * Designation: Security Guard
 * 
 * Reads photos directly from the form images.
 * 
 * Usage: node scratch/insert_iust_employees.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const sharp = require('sharp');

const DB_URL = 'postgresql://neondb_owner:npg_NKewaOp70Uix@ep-shiny-king-aosr4w3y-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

const IUST_FORMS_DIR = path.join(__dirname, '..', '..', 'valley-agency-portal', 'NEW IUST');

// -------------------------------------------------------------------------
// 19 unique IUST employees extracted from the 23 form images
// (duplicates removed: Heemu Muzaffar appeared twice, Afkeena Amin appeared twice,
//  Mukhtar Ahmad Khan appeared twice)
// -------------------------------------------------------------------------
const iustEmployees = [
  {
    name: 'Heemu Muzaffar',
    fatherName: 'Muzaffar Ahmad Miani',
    address: 'Iqbal Colony Awantipora, Pulwama - 192122',
    mobile: '9149698306',
    dob: '1975-02-14',
    gender: 'Female',
    adhaar: '6383 4746 3376',
    bankAccount: '0938040100000591',
    formPhoto: 'WhatsApp Image 2026-07-20 at 10.52.49 AM.jpeg',
  },
  {
    name: 'Onsi Mohiuddin',
    fatherName: 'Gh. Mohd Uddin Ganie',
    address: 'Nehar Khasi Pora, Tral, Pulwama - 192123',
    mobile: '9596549272',
    dob: '1999-02-15',
    gender: 'Female',
    adhaar: '7927 5950 8316',
    bankAccount: '1254040B00017129',
    formPhoto: 'WhatsApp Image 2026-07-20 at 10.53.00 AM.jpeg',
  },
  {
    name: 'Afkeena Amin',
    fatherName: 'Mohammad Amin Sheikh',
    address: 'Sheikh Mohalla Awantipora, Pulwama',
    mobile: '9149407621',
    dob: '2004-10-06',
    gender: 'Female',
    adhaar: '6955 1734 7460',
    bankAccount: '0334040150005517',
    formPhoto: 'WhatsApp Image 2026-07-20 at 10.53.11 AM.jpeg',
  },
  {
    name: 'Mukhtar Ahmad Khan',
    fatherName: 'Ghulam Ahmad Khan',
    address: 'Midoora Near Jamia Masjid Sharif, Awantipora, Pulwama - 192122',
    mobile: '9797240217',
    dob: '1969-03-08',
    gender: 'Male',
    bloodGroup: 'B+',
    adhaar: '7048 4984 6304',
    bankAccount: '0334040100026635',
    formPhoto: 'WhatsApp Image 2026-07-20 at 10.53.28 AM.jpeg',
  },
  {
    name: 'Shaista Nabi',
    fatherName: 'Ghulam Nabi Ganie',
    address: 'Kumhau Mohalla Awantipora - 192122',
    mobile: '9469159596',
    dob: '2002-10-15',
    gender: 'Female',
    adhaar: '6683 0211 6207',
    bankAccount: '0938040100000175',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.08.20 PM.jpeg',
  },
  {
    name: 'Rohee Jan',
    fatherName: 'Nazir Ahmad Kumhar',
    address: 'Kumhar Mohalla Awantipora - 192122',
    mobile: '7006364760',
    dob: '1997-05-20',
    gender: 'Female',
    adhaar: '4572 4530 5602',
    bankAccount: '0334040100025347',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.08.31 PM.jpeg',
  },
  {
    name: 'Furkan Farooq',
    fatherName: 'Farooq Ahmad Ganie',
    address: 'Kaichan Koot, Pulwama Tral - 192123',
    mobile: '9797707530',
    dob: '2005-03-06',
    gender: 'Female',
    adhaar: '2423 1000 9445',
    bankAccount: '1254041000001637',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.08.39 PM.jpeg',
  },
  {
    name: 'Neezo Amin',
    fatherName: 'Mohammad Amin Rahi',
    address: 'Ghat Mohalla Awantipora, Pulwama - 192122',
    mobile: '8899667530',
    dob: '1998-01-01',
    gender: 'Female',
    designation: 'Security Guard',
    bloodGroup: '',
    adhaar: '5576 0258 2675',
    bankAccount: '0938040100000540',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.08.46 PM.jpeg',
  },
  {
    name: 'Azra Bashir Trumboo',
    fatherName: 'Bashir Ahmad Trumboo',
    address: 'Ghat Mohalla Awantipora, Pulwama - 192122',
    mobile: '7889930641',
    dob: '1996-11-08',
    gender: 'Female',
    adhaar: '0972 3717 2936',
    bankAccount: '0334041550050042',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.08.53 PM.jpeg',
  },
  {
    name: 'Ghowhar Ahmad Kumar',
    fatherName: 'Gh. Qadir Kumar',
    address: 'Charri Sharif, Budgam - 191111',
    mobile: '9149523125',
    dob: '1993-03-11',
    gender: 'Male',
    adhaar: '3634 7227 1135',
    bankAccount: '0049041000000340',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.09.00 PM.jpeg',
  },
  {
    name: 'Mugsir Jan',
    fatherName: 'Ghulam Mohammad Kumar',
    address: 'Kumar Mohalla Awantipora - 192122',
    mobile: '8082194173',
    dob: '1997-10-10',
    gender: 'Female',
    adhaar: '5404 0000 0014',
    bankAccount: '0334040150006262',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.09.12 PM.jpeg',
  },
  {
    name: 'Bashir Ul Haq',
    fatherName: 'Bashir Ahmad Khan',
    address: 'Khankah Awantipora, Pulwama',
    mobile: '8083790673',
    dob: '1982-08-06',
    gender: 'Male',
    adhaar: '8345 2930 9351',
    bankAccount: '0938040100000959',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.09.48 PM.jpeg',
  },
  {
    name: 'Muzaffar Ahmad Mochi',
    fatherName: 'Ghulam Mohammad Mochi',
    address: 'Rathcuna Ratsoo, Pulwama Tral - 192123',
    mobile: '9596737971',
    dob: '1995-02-19',
    gender: 'Male',
    bloodGroup: 'A+',
    adhaar: '5327 3166 0737',
    bankAccount: '0761040100000114',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.09.54 PM.jpeg',
  },
  {
    name: 'Zeeshan Bashir',
    fatherName: 'Bashir Ahmad Khan',
    address: 'Pinglish, Pulwama Tral - 192123',
    mobile: '9797090683',
    dob: '1993-03-10',
    gender: 'Male',
    adhaar: '9701 1024 7921',
    bankAccount: '0065040100049329',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.10.00 PM.jpeg',
  },
  {
    name: 'Mohammad Jeelani Wani',
    fatherName: 'Mohd Anwur Wani',
    address: 'Tangpora Dadalsara, Pulwama Tral - 192133',
    mobile: '6005545287',
    dob: '1996-03-08',
    gender: 'Male',
    adhaar: '9930 7190 9752',
    bankAccount: '0065040B000349 36',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.10.06 PM.jpeg',
  },
  {
    name: 'Bilal Ahmad Reshi',
    fatherName: 'Gh. Mohiuddin Reshi',
    address: 'Sail Awantipora, Pulwama - 192123',
    mobile: '8825069240',
    dob: '1989-03-01',
    gender: 'Male',
    adhaar: '9496 4181 3406',
    bankAccount: '0005040100056003',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.10.12 PM.jpeg',
  },
  {
    name: 'Javed Iqbal',
    fatherName: 'Mohd Abdullah Dar',
    address: 'Charar-i-Sharief Talabi Kalom, Budgam - 191111',
    mobile: '7889435402',
    dob: '1988-06-20',
    gender: 'Male',
    adhaar: '5479 4073 6964',
    bankAccount: '0049040100012709',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.20.35 PM.jpeg',
  },
  {
    name: 'Manzoor Ahmad Kumar',
    fatherName: 'Gh. Mohd Kumar',
    address: 'Amlar, Pulwama Tral - 192123',
    mobile: '8089740297',
    dob: '1984-04-03',
    gender: 'Male',
    adhaar: '9126 6408 1670',
    bankAccount: '0334040165014576',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.20.44 PM.jpeg',
  },
  {
    name: 'Shahbaz Ali',
    fatherName: 'Ali Mohammad Shah',
    address: 'Iqbal Abad Charar-i-Sharief, Budgam - 191119',
    mobile: '9906600928',
    dob: '1991-06-04',
    gender: 'Male',
    adhaar: '9033 5867 8022',
    bankAccount: '0049040B000 23187',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.20.50 PM.jpeg',
  },
  {
    name: 'Muzamil Gami',
    fatherName: 'Abdul Gami O Rahi',
    address: 'Ghat Moralla Awantipora, Pulwama',
    mobile: '9596303060',
    dob: '1995-12-31',
    gender: 'Male',
    adhaar: '3010 0403 5013',
    bankAccount: '0938040100005049',
    formPhoto: 'WhatsApp Image 2026-07-20 at 1.20.56 PM.jpeg',
  },
];

// -------------------------------------------------------------------------
// Helper: Generate a random token
// -------------------------------------------------------------------------
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// -------------------------------------------------------------------------
// Helper: Generate next employee ID
// -------------------------------------------------------------------------
async function getNextEmployeeId(client) {
  const res = await client.query(`SELECT data FROM employees ORDER BY (data->>'id') DESC LIMIT 50`);
  let maxNum = 1176; // start after current max
  for (const row of res.rows) {
    const id = row.data?.id || '';
    const match = id.match(/VSA-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `VSA-${maxNum + 1}`;
}

// -------------------------------------------------------------------------
// Helper: Read form image and crop photo region from top-right
// -------------------------------------------------------------------------
async function extractPhotoFromForm(formFile) {
  const imgPath = path.join(IUST_FORMS_DIR, formFile);
  if (!fs.existsSync(imgPath)) {
    console.warn(`  [WARN] Form image not found: ${imgPath}`);
    return null;
  }

  try {
    // Get image dimensions
    const meta = await sharp(imgPath).metadata();
    const { width, height } = meta;

    // The passport photo is typically in the top-right corner of the form
    // Approximate crop: right ~25% width, top ~18% height
    const cropX = Math.floor(width * 0.62);
    const cropY = Math.floor(height * 0.01);
    const cropW = Math.floor(width * 0.35);
    const cropH = Math.floor(height * 0.20);

    const croppedBuffer = await sharp(imgPath)
      .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
      .resize(413, 531, { fit: 'cover', position: 'center' }) // standard passport size ratio
      .jpeg({ quality: 85 })
      .toBuffer();

    const base64 = croppedBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    console.error(`  [ERROR] Failed to crop photo from ${formFile}:`, err.message);
    return null;
  }
}

// -------------------------------------------------------------------------
// Main insert function
// -------------------------------------------------------------------------
async function insertIustEmployees() {
  const client = await pool.connect();
  const today = new Date().toISOString().split('T')[0];

  try {
    console.log('=== IUST Employee Insertion Script ===');
    console.log(`Total employees to insert: ${iustEmployees.length}`);
    console.log('');

    let startId = 1177;
    const insertedEmployees = [];

    for (let i = 0; i < iustEmployees.length; i++) {
      const emp = iustEmployees[i];
      const empId = `VSA-${startId + i}`;

      console.log(`[${i + 1}/${iustEmployees.length}] Processing: ${emp.name} → ${empId}`);

      // Extract photo from form
      process.stdout.write(`  Extracting photo from form image...`);
      const photoBase64 = await extractPhotoFromForm(emp.formPhoto);
      console.log(photoBase64 ? ' ✓' : ' ✗ (no photo)');

      // Build employee object
      const secureToken = generateToken();
      const employeeData = {
        id: empId,
        name: emp.name,
        fatherName: emp.fatherName || '',
        relationType: 'S/O',
        currentAddress: emp.address || '',
        permanentAddress: emp.address || '',
        mobile: emp.mobile || '',
        dob: emp.dob || '',
        gender: emp.gender || '',
        bloodGroup: emp.bloodGroup || '',
        designation: emp.designation || 'Security Guard',
        department: 'Islamic University of Science and Technology (IUST) Awantipora',
        email: '',
        aadhaarNo: emp.adhaar || '',
        bankAccount: emp.bankAccount || '',
        status: 'Active',
        joinDate: today,
        cardValidity: 3,
        secureToken: secureToken,
        documents: {
          photo: photoBase64 ? `/api/employees/${empId}/photo` : '',
          signature: '',
          aadhaar: '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store photo in photos table if exists
      if (photoBase64) {
        try {
          // Check if photos table exists
          const photosTableRes = await client.query(
            `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employee_photos') AS exists`
          );
          if (photosTableRes.rows[0].exists) {
            await client.query(
              `INSERT INTO employee_photos (employee_id, photo_data, updated_at) VALUES ($1, $2, NOW())
               ON CONFLICT (employee_id) DO UPDATE SET photo_data = EXCLUDED.photo_data, updated_at = NOW()`,
              [empId, photoBase64]
            );
            console.log(`  Photo stored in employee_photos table ✓`);
          } else {
            // Store inline in data
            employeeData.documents.photo = photoBase64;
            console.log(`  Photo stored inline in employee data ✓`);
          }
        } catch (photoErr) {
          console.warn(`  [WARN] Photo table insert failed, storing inline:`, photoErr.message);
          employeeData.documents.photo = photoBase64;
        }
      }

      // Insert employee into employees table
      await client.query(
        `INSERT INTO employees (id, data) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
        [empId, JSON.stringify(employeeData)]
      );

      console.log(`  ✅ ${emp.name} (${empId}) inserted successfully`);
      insertedEmployees.push({ id: empId, name: emp.name, data: employeeData });
    }

    console.log('');
    console.log('=== Insertion Complete ===');
    console.log(`Successfully inserted ${insertedEmployees.length} employees`);
    console.log('');
    console.log('Summary:');
    insertedEmployees.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.id} - ${e.name}`);
    });

    return insertedEmployees;
  } finally {
    client.release();
    await pool.end();
  }
}

insertIustEmployees().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
