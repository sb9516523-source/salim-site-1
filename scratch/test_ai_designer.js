const jwt = require('jsonwebtoken');

const JWT_SECRET = "f80c2aaf18594103a5ce33db44ccbe16f4e9d91c8bb01be27dacf97c940b8032943599c366329058d0742330e037f647";

// Generate admin token
const token = jwt.sign(
  { email: 'admin@valleysecurity.com', role: 'superadmin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log("Mock Admin Token generated:", token);

// Make post request to http://localhost:3000/api/templates/generate-ai
async function test() {
  const prompt = "Create a premium dark-themed layout with gold header bar, outfit font, and large details for AG Office guards";
  
  console.log(`Sending prompt to AI designer: "${prompt}"...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/templates/generate-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${token}`
      },
      body: JSON.stringify({ prompt })
    });

    const resData = await response.json();
    console.log("HTTP Response Status:", response.status);
    console.log("Response Payload:\n", JSON.stringify(resData, null, 2));
    
    if (resData.success && resData.data.name) {
      console.log("✅ SUCCESS: AI Template designer generated a valid template layout!");
    } else {
      console.error("❌ FAILURE: Template generation was unsuccessful.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test();
