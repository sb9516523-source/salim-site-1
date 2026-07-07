const jwt = require('jsonwebtoken');

const JWT_SECRET = "f80c2aaf18594103a5ce33db44ccbe16f4e9d91c8bb01be27dacf97c940b8032943599c366329058d0742330e037f647";

// Generate admin token
const token = jwt.sign(
  { email: 'admin@valleysecurity.com', role: 'superadmin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Template configuration to save
const dummyTemplate = {
  id: "tpl-test-git-sync",
  name: "Git Sync Verification Test Layout",
  layout: "vertical",
  font: "'Outfit', sans-serif",
  backgroundColor: "#1A1A1A",
  headerBgColor: "#C19A6B",
  accentColor: "#A3855E",
  headerText: "AG Office Security",
  subheaderText: "Official ID",
  logoSize: 80,
  headerHeight: 110,
  headerFontSize: 20,
  photoWidth: 100,
  photoHeight: 120,
  qrSize: 90,
  detailsFontSize: 12,
  nameFontSize: 20,
  designationFontSize: 16,
  labelColor: "#CCCCCC",
  valueColor: "#FFFFFF",
  rowPadding: 6,
  labelWidth: 65,
  labelValueSpacing: 8,
  logo: "preset-shield",
  signature: "preset-sig1",
  fields: {
    photo: true,
    name: true,
    designation: true,
    department: true,
    empid: true,
    father: true,
    phone: true,
    email: true,
    blood: true,
    address: true,
    signature: true,
    qrcode: true,
    barcode: false,
    validity: true
  }
};

async function test() {
  console.log("Saving test template to trigger Git Auto-Sync...");
  try {
    const response = await fetch('http://localhost:3000/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${token}`
      },
      body: JSON.stringify(dummyTemplate)
    });

    const resData = await response.json();
    console.log("HTTP Response Status:", response.status);
    console.log("Saved Template Payload:", resData);

    if (response.ok && resData.id) {
      console.log("✅ SUCCESS: Saved template to DB! Wait 5 seconds for Git push sync process...");
      
      // We will check the local git log to see if a commit was made in the background
      setTimeout(() => {
        const { execSync } = require('child_process');
        const gitLog = execSync('git log -n 1 --oneline', { encoding: 'utf8' });
        console.log("Latest Git Commit:\n", gitLog);
      }, 5000);
      
    } else {
      console.error("❌ FAILURE: Template save failed.");
    }
  } catch (err) {
    console.error("Error during test:", err);
  }
}

test();
