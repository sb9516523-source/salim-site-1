/**
 * Insert All 68 IUST Employees from PDF Master List
 * ==================================================
 * Department: Islamic University of Science and Technology
 * Designation: Security Guard
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

// Map of existing form photos from the 23 images in NEW IUST
const formPhotoMap = {
  'heemu muzaffar': 'WhatsApp Image 2026-07-20 at 10.52.49 AM.jpeg',
  'onsi mohiuddin': 'WhatsApp Image 2026-07-20 at 10.53.00 AM.jpeg',
  'onsi mohi ud din': 'WhatsApp Image 2026-07-20 at 10.53.00 AM.jpeg',
  'afkeena amin': 'WhatsApp Image 2026-07-20 at 10.53.11 AM.jpeg',
  'afreen amin': 'WhatsApp Image 2026-07-20 at 10.53.11 AM.jpeg',
  'mukhtar ahmad khan': 'WhatsApp Image 2026-07-20 at 10.53.28 AM.jpeg',
  'shaista nabi': 'WhatsApp Image 2026-07-20 at 1.08.20 PM.jpeg',
  'rohee jan': 'WhatsApp Image 2026-07-20 at 1.08.31 PM.jpeg',
  'furkan farooq': 'WhatsApp Image 2026-07-20 at 1.08.39 PM.jpeg',
  'neezo amin': 'WhatsApp Image 2026-07-20 at 1.08.46 PM.jpeg',
  'neezu amin': 'WhatsApp Image 2026-07-20 at 1.08.46 PM.jpeg',
  'azra bashir trumboo': 'WhatsApp Image 2026-07-20 at 1.08.53 PM.jpeg',
  'azra bashir': 'WhatsApp Image 2026-07-20 at 1.08.53 PM.jpeg',
  'ghowhar ahmad kumar': 'WhatsApp Image 2026-07-20 at 1.09.00 PM.jpeg',
  'mugsir jan': 'WhatsApp Image 2026-07-20 at 1.09.12 PM.jpeg',
  'mysir jan': 'WhatsApp Image 2026-07-20 at 1.09.12 PM.jpeg',
  'bashir ul haq khan': 'WhatsApp Image 2026-07-20 at 1.09.48 PM.jpeg',
  'bashir ul haq': 'WhatsApp Image 2026-07-20 at 1.09.48 PM.jpeg',
  'muzafar ahmad mochi': 'WhatsApp Image 2026-07-20 at 1.09.54 PM.jpeg',
  'muzaffar ahmad mochi': 'WhatsApp Image 2026-07-20 at 1.09.54 PM.jpeg',
  'zeeshan bashir': 'WhatsApp Image 2026-07-20 at 1.10.00 PM.jpeg',
  'mohammad jeelani wani': 'WhatsApp Image 2026-07-20 at 1.10.06 PM.jpeg',
  'bilal ahmad reshi': 'WhatsApp Image 2026-07-20 at 1.10.12 PM.jpeg',
  'javed iqbal': 'WhatsApp Image 2026-07-20 at 1.20.35 PM.jpeg',
  'javed iqbal dar': 'WhatsApp Image 2026-07-20 at 1.20.35 PM.jpeg',
  'manzoor ahmad kumar': 'WhatsApp Image 2026-07-20 at 1.20.44 PM.jpeg',
  'shahbaz ali': 'WhatsApp Image 2026-07-20 at 1.20.50 PM.jpeg',
  'shabaz ali shah': 'WhatsApp Image 2026-07-20 at 1.20.50 PM.jpeg',
  'muzamil gani rah': 'WhatsApp Image 2026-07-20 at 1.20.56 PM.jpeg'
};

// Crop photo from form image
async function extractPhotoFromForm(formFile) {
  const imgPath = path.join(IUST_FORMS_DIR, formFile);
  if (!fs.existsSync(imgPath)) return null;

  try {
    const meta = await sharp(imgPath).metadata();
    const { width, height } = meta;
    const cropX = Math.floor(width * 0.62);
    const cropY = Math.floor(height * 0.01);
    const cropW = Math.floor(width * 0.35);
    const cropH = Math.floor(height * 0.20);

    const croppedBuffer = await sharp(imgPath)
      .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
      .resize(413, 531, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toBuffer();

    return `data:image/jpeg;base64,${croppedBuffer.toString('base64')}`;
  } catch (err) {
    return null;
  }
}

// 49 Male guards
const maleGuards = [
  { sNo: 1, name: "Bilal Ahmad Wani", fatherName: "Abdul Rashid Wani", address: "Gulzar Pora Awantipora", mobile: "7298629947", joinDate: "2022-02-15" },
  { sNo: 2, name: "Bilal Ahmad Reshi", fatherName: "Gh. Mohi U Din Reshi", address: "Sail Chersoo Awantipora", mobile: "8825069248", joinDate: "2022-02-16" },
  { sNo: 3, name: "Umar Akram Sheergojri", fatherName: "Mohd Akram Sheergojri", address: "Awantipora Pulwama", mobile: "9541299445", joinDate: "2023-08-01" },
  { sNo: 4, name: "Omar Hussain Dar", fatherName: "Gh. Hussain Dar", address: "Shahabad Awantipora", mobile: "9596400425", joinDate: "2024-04-18" },
  { sNo: 5, name: "Majid Ul Ahad Sofi", fatherName: "Abdul Ahad Sofi", address: "Iqbal Colony Awantipora", mobile: "9797962792", joinDate: "2024-05-23" },
  { sNo: 6, name: "Muzafar Ahmad Mochi", fatherName: "Ghulam Mohammad Mochi", address: "Mochi Mohalla Rathsuna Tral", mobile: "9596737971", joinDate: "2024-05-23" },
  { sNo: 7, name: "Bashir Ul Haq Khan", fatherName: "Bashir Ahmad Khan", address: "Khankah Awantipora", mobile: "8082790673", joinDate: "2024-07-04" },
  { sNo: 8, name: "Fayaz Ahmad Thoker", fatherName: "Abdul Razak Thoker", address: "Shariabad Tral Pulwama", mobile: "9541471058", joinDate: "2024-07-23" },
  { sNo: 9, name: "Idrees Ahmad Khan", fatherName: "Iftikhar Ahmad Khan", address: "Khanpora Yaripora Kulgam", mobile: "7780810613", joinDate: "2024-07-23" },
  { sNo: 10, name: "John Mohammad Thoker", fatherName: "Mohammad Subhan Thoker", address: "Shairabad Tral Pulwama", mobile: "9797008055", joinDate: "2024-07-23" },
  { sNo: 11, name: "Owais Gulzar", fatherName: "Gulzar Ahmad Haroo", address: "Bilal Colony Awantipora", mobile: "9149539366", joinDate: "2024-10-17" },
  { sNo: 12, name: "Zeeshan Bashir", fatherName: "Bashir Ahmad Kar", address: "Pinglish Tral", mobile: "9797890683", joinDate: "2024-10-17" },
  { sNo: 13, name: "Irfan Akram Wani", fatherName: "Mohd Akram Wani", address: "Iqbal Colony Awantipora", mobile: "9622937977", joinDate: "2025-05-21" },
  { sNo: 14, name: "Muzamil Gani Rah", fatherName: "Abdul Gani Rah", address: "Ghat Mohallah Awantipora", mobile: "9596303068", joinDate: "2025-05-21" },
  { sNo: 15, name: "Imtiyaz Ahmad Lone", fatherName: "Mohd Shaban Lone", address: "Midoora Awantipora", mobile: "8899675328", joinDate: "2025-05-21" },
  { sNo: 16, name: "Fayaz Ahmad Sheikh", fatherName: "Gh. Mohd Sheikh", address: "Jawbara Awantipora", mobile: "9682302655", joinDate: "2025-05-21" },
  { sNo: 17, name: "Faizan Fayaz Reshi", fatherName: "Fayaz Ahmad Reshi", address: "Chersoo Bonpora Awantipora", mobile: "7889310503", joinDate: "2025-05-23" },
  { sNo: 18, name: "Sajad Ahmad Sheergojri", fatherName: "Ghulam Nabi Sheergojri", address: "Kathroo Mohallah Awantipora", mobile: "9596146100", joinDate: "2025-05-31" },
  { sNo: 19, name: "Arbaz Amin Bhat", fatherName: "Mohd Amin Bhat", address: "Rathsona Tral Pulwama", mobile: "6005327342", joinDate: "2025-07-01" },
  { sNo: 20, name: "Irfan Ahmad Chopan", fatherName: "Abdul Rashid Chopan", address: "Iqbal Colony Awantipora", mobile: "6006102718", joinDate: "2025-07-01" },
  { sNo: 21, name: "Basit Manzoor Bhat", fatherName: "Manzoor Ahmad Bhat", address: "Herapora Awantipora", mobile: "9906767432", joinDate: "2025-07-01" },
  { sNo: 22, name: "Umer Ashraf Sheergojri", fatherName: "Mohammad Ashraf Sheergojri", address: "Kumar Mohallah Awantipora", mobile: "9541148236", joinDate: "2025-07-01" },
  { sNo: 23, name: "Rouf Amin Rah", fatherName: "Mohammad Amin Rah", address: "Ghat Mohallah Awantipora", mobile: "7889306573", joinDate: "2025-07-01" },
  { sNo: 24, name: "Sheikh Zeeshan Bashir", fatherName: "Bashir Ahmad Sheikh", address: "Saimooh Tral", mobile: "8899816747", joinDate: "2025-07-01" },
  { sNo: 25, name: "Faisal Gulzar", fatherName: "Gulzar Ahmad Kuchay", address: "Barsoo Awantipora Pulwama", mobile: "7006387801", joinDate: "2025-07-23" },
  { sNo: 26, name: "Javid Ahmad Lone", fatherName: "Assadullah Lone", address: "Kashipora Tral Pulwama", mobile: "9906597316", joinDate: "2025-07-23" },
  { sNo: 27, name: "Adil Rashid Khan", fatherName: "Abdul Rashid Khan", address: "Barsoo Awantipora Pulwama", mobile: "9149905070", joinDate: "2025-08-01" },
  { sNo: 28, name: "Adil Aziz Dar", fatherName: "Abdul Aziz Dar", address: "Iqbal Colony Awantipora", mobile: "7006750585", joinDate: "2025-08-01" },
  { sNo: 29, name: "Rouf Ahmad Khan", fatherName: "Abdul Rashid Khan", address: "Barsoo Awantipora Pulwama", mobile: "7051627096", joinDate: "2025-08-01" },
  { sNo: 30, name: "Muzaffar Ahmad Wani", fatherName: "Mohd Abdullah Wani", address: "Naner Tral Pulwama", mobile: "6006120832", joinDate: "2025-08-01" },
  { sNo: 31, name: "Aamir Ahamd Wani", fatherName: "Gh. Ahmad Wani", address: "Wani House Awantipora", mobile: "6005895004", joinDate: "2025-08-01" },
  { sNo: 32, name: "Sheeraz Ahmad Shah", fatherName: "Jalal Ud Din Shah", address: "Wani Wasimarg Khaigam Charar I Sharief Budgam", mobile: "9596545161", joinDate: "2025-08-01" },
  { sNo: 33, name: "Ashiq Tariq Wagay", fatherName: "Tariq Ahmad Wagay", address: "Kanidajan Charar I Sharief Budgam", mobile: "9682669868", joinDate: "2025-08-01" },
  { sNo: 34, name: "Mehraj Ud Din Kumar", fatherName: "Abdul Salam Kumar", address: "Kumar Mohallah Charar-I-Sharief Budgam", mobile: "9682344139", joinDate: "2025-08-01" },
  { sNo: 35, name: "Javaid Ahmad Dar", fatherName: "Abdul Rashid Dar", address: "Charwani Charar-i-Sharief Budgam", mobile: "9622473278", joinDate: "2025-10-01" },
  { sNo: 36, name: "Ghowhar Ahmad Kumar", fatherName: "Gh. Qadir Khumar", address: "Kumar Mohalla Charar-i-Sharief Budgam", mobile: "9149523125", joinDate: "2025-10-01" },
  { sNo: 37, name: "Mukhtar Ahmad Khan", fatherName: "Gh. Ahmad Khan", address: "Midoora Awantipora", mobile: "9797240217", joinDate: "2022-02-15" },
  { sNo: 38, name: "Falail Singh", fatherName: "Paramjeet Singh", address: "Dharam Gund Tral Pulwama", mobile: "8899679586", joinDate: "2025-10-01" },
  { sNo: 39, name: "Manzoor Ahmad Kumar", fatherName: "Gh. Mohd Kumar", address: "Amlar Tral Pulwama", mobile: "8082740297", joinDate: "2022-06-13" },
  { sNo: 40, name: "Mohammad Jeelani Wani", fatherName: "Mohd Anwar Wani", address: "Tangpora Dadsara Tral Pulwama", mobile: "6005545287", joinDate: "2025-11-01" },
  { sNo: 41, name: "Takib Raja", fatherName: "Abdul Rashid Bader", address: "Bilal Colony Awantipora Pulwama", mobile: "7889409610", joinDate: "2025-11-01" },
  { sNo: 42, name: "Tariq Ahmad Bhat", fatherName: "Ghulam Nabi Bhat", address: "Awantipora Pulwama", mobile: "6005762033", joinDate: "2026-03-04" },
  { sNo: 43, name: "Zaid Bin Ahmad Dar", fatherName: "Gh. Ahmad Dar", address: "Bilal Colony Awantipora Pulwama", mobile: "7006721634", joinDate: "2026-04-13" },
  { sNo: 44, name: "Arif Ashraf Ganie", fatherName: "Mohammad Ashraf Ganie", address: "Kachikoote Awantipora Pulwama", mobile: "8899010319", joinDate: "2026-04-13" },
  { sNo: 45, name: "Shabaz Ali Shah", fatherName: "Ali Mohammad Shah", address: "Iqbal Abad Charar-i-Sharief Budgam", mobile: "9906600928", joinDate: "2026-04-13" },
  { sNo: 46, name: "Aamir Hilal Bhat", fatherName: "Hilal Ahmad Bhat", address: "Heerpora Awantipora Pulwama", mobile: "7006260268", joinDate: "2026-04-16" },
  { sNo: 47, name: "Shabir Ahmad Najar", fatherName: "Mohd Abdullah Najar", address: "Rajpora Awantipora Pulwama", mobile: "9622547937", joinDate: "2026-04-22" },
  { sNo: 48, name: "Hazik Nazir Lone", fatherName: "Nazir Ahmad Lone", address: "Barsoo Awantipora Pulwama", mobile: "6005383117", joinDate: "2026-05-01" },
  { sNo: 49, name: "Javed Iqbal Dar", fatherName: "Mohd Abdullah Dar", address: "Talabikalan Charar-i-Sharief Budgam", mobile: "7889435402", joinDate: "2026-05-01" }
];

// 19 Female guards
const femaleGuards = [
  { sNo: 1, name: "Heemu Muzaffar", fatherName: "Muzaffar Ahmad Wani", address: "Iqbal Colony Awantipora", mobile: "9149698306", joinDate: "2024-10-17" },
  { sNo: 2, name: "Insha Mohi Ud Din", fatherName: "Gh Mohi Ud Din", address: "Lorow Aripal Tral Pulwama", mobile: "9797947299", joinDate: "2024-10-17" },
  { sNo: 3, name: "Sheemu Khursheed", fatherName: "Late Khursheed Ahmad Nath", address: "Jawbara Awantipora", mobile: "9596307454", joinDate: "2024-10-17" },
  { sNo: 4, name: "Onsi Mohi Ud Din", fatherName: "Ghulam Mohi Ud Din", address: "Neher Khasipora Tral", mobile: "9596549272", joinDate: "2024-10-18" },
  { sNo: 5, name: "Shaista Nabi", fatherName: "Ghulam Nabi Ganai", address: "Kumar Mohallah Awantipora", mobile: "9469159596", joinDate: "2024-10-21" },
  { sNo: 6, name: "Neezu Amin", fatherName: "Mohammad Amin Rah", address: "Ghat Mohallah Awantipora", mobile: "8899667530", joinDate: "2025-07-01" },
  { sNo: 7, name: "Shafiya Showkat", fatherName: "Showkat Ahmad Pinchoo", address: "Ghat Mohallah Awantipora", mobile: "6006271804", joinDate: "2025-07-23" },
  { sNo: 8, name: "Furkan Farooq", fatherName: "Farooq Ahmad Ganie", address: "Kaichkoot Awantipora Pulwama", mobile: "9797987530", joinDate: "2025-07-23" },
  { sNo: 9, name: "Nasreena Jan", fatherName: "Ghulam Nabi Kumar", address: "Kumar Mohallah Charar-I-Sharief Budgam", mobile: "9103850756", joinDate: "2025-07-23" },
  { sNo: 10, name: "Mymoona Bano", fatherName: "Ghulam Mohd Kumar", address: "Kumar Mohallah Charar-I-Sharief Budgam", mobile: "9622919178", joinDate: "2025-07-23" },
  { sNo: 11, name: "Hadi Jan", fatherName: "Ghulam Nabi Najar", address: "Main Bazar Charar-i-Sharief Budgam", mobile: "6006612714", joinDate: "2025-09-01" },
  { sNo: 12, name: "Ifra Manzoor", fatherName: "Manzoor Ahmad Sheikh", address: "Baooh Awantipora", mobile: "7006217421", joinDate: "2025-10-01" },
  { sNo: 13, name: "Rohee Jan", fatherName: "Nazir Ahmad Kumhar", address: "Kumar Mohallah Awantipora", mobile: "7006364760", joinDate: "2025-10-01" },
  { sNo: 14, name: "Mysir Jan", fatherName: "Gh. Mohammad Kumar", address: "Kumar Mohallah Awantipora", mobile: "8082194173", joinDate: "2025-10-01" },
  { sNo: 15, name: "Humeira Manzoor", fatherName: "Manzoor Ahmad Bader", address: "Kumar Mohallah Awantipora Pulwama", mobile: "9541013024", joinDate: "2025-11-01" },
  { sNo: 16, name: "Azra Bashir", fatherName: "Bashir Ahmad Tramboo", address: "Ghat Mohallah Awantipora Pulwama", mobile: "7889913674", joinDate: "2025-11-01" },
  { sNo: 17, name: "Insha Manzoor", fatherName: "Manzoor Ahmad Pandit", address: "Herpora Awantipora Pulwama", mobile: "8491840312", joinDate: "2025-11-01" },
  { sNo: 18, name: "Afreen Amin", fatherName: "Mohd. Amin Sheikh", address: "Sheikh Mohallah Awantipora Pulwama", mobile: "9149487621", joinDate: "2025-11-01" },
  { sNo: 19, name: "Maroofa Akhter", fatherName: "Ghulam Ahmad Kumar", address: "Kumar Mohallah Awantipora Pulwama", mobile: "6005467210", joinDate: "2026-04-13" }
];

async function runMasterInsertion() {
  const client = await pool.connect();
  const DEPARTMENT = 'Islamic University of Science and Technology';

  try {
    console.log('=== MASTER IUST EMPLOYEE INSERTION ===');

    const allGuards = [
      ...maleGuards.map(g => ({ ...g, gender: 'Male' })),
      ...femaleGuards.map(g => ({ ...g, gender: 'Female' }))
    ];

    console.log(`Total guards to process: ${allGuards.length}`);

    let startIdNum = 1177;
    const insertedRecords = [];

    for (let i = 0; i < allGuards.length; i++) {
      const item = allGuards[i];
      const empId = `VSA-${startIdNum + i}`;

      const lookupKey = item.name.toLowerCase().trim();
      const photoFile = formPhotoMap[lookupKey];
      let photoBase64 = '';

      if (photoFile) {
        photoBase64 = await extractPhotoFromForm(photoFile);
      }

      const secureToken = crypto.randomBytes(16).toString('hex');
      const employeeData = {
        id: empId,
        name: item.name,
        fatherName: item.fatherName,
        relationType: item.gender === 'Female' ? 'D/O' : 'S/O',
        currentAddress: item.address,
        permanentAddress: item.address,
        mobile: item.mobile,
        dob: '',
        gender: item.gender,
        bloodGroup: '',
        designation: 'Security Guard',
        department: DEPARTMENT,
        email: '',
        aadhaarNo: '',
        bankAccount: '',
        status: 'Active',
        joinDate: item.joinDate,
        cardValidity: 3,
        secureToken: secureToken,
        photoStatus: photoBase64 ? 'Available' : 'Pending Upload',
        documents: {
          photo: photoBase64 ? `/api/employees/${empId}/photo` : '',
          signature: '',
          aadhaar: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await client.query(
        `INSERT INTO employees (id, data) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
        [empId, JSON.stringify(employeeData)]
      );

      if (photoBase64) {
        try {
          await client.query(
            `INSERT INTO employee_photos (employee_id, photo_data, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (employee_id) DO UPDATE SET photo_data = EXCLUDED.photo_data, updated_at = NOW()`,
            [empId, photoBase64]
          );
        } catch (e) {}
      }

      console.log(`[${i+1}/${allGuards.length}] ${empId} - ${item.name} (${item.gender}) ${photoBase64 ? '📷 Photo Linked' : '⏳ Pending Upload'}`);
      insertedRecords.push(employeeData);
    }

    console.log('\n=== INSERTION COMPLETE ===');
    console.log(`Successfully processed all ${insertedRecords.length} IUST guards.`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMasterInsertion().catch(console.error);
