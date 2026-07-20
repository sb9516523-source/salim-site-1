const { PDFParse } = require('pdf-parse');
const fs = require('fs');

const pdfPath = 'C:/Users/salim/.gemini/antigravity/scratch/valley-agency-portal/IUST.pdf';

async function main() {
  const parser = new PDFParse({ verbosity: 0 });
  await parser.load(pdfPath);  // load by filepath, not buffer
  const textResult = await parser.getText();
  console.log('=== PDF TEXT ===');
  // getText returns pages array
  if (Array.isArray(textResult?.pages)) {
    textResult.pages.forEach((pg, i) => {
      console.log(`\n--- PAGE ${i+1} ---`);
      if (Array.isArray(pg.items)) {
        pg.items.forEach(item => { if(item.str) process.stdout.write(item.str + ' '); });
      } else {
        console.log(JSON.stringify(pg).substring(0, 500));
      }
    });
  } else {
    console.log(JSON.stringify(textResult, null, 2).substring(0, 3000));
  }
}

main().catch(err => {
  console.error('Error:', err.message);
});
