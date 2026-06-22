const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directories if they don't exist
const dirs = [
    path.join(__dirname, 'public', 'fonts'),
    path.join(__dirname, 'public', 'lib'),
    path.join(__dirname, 'public', 'img')
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

const libs = [
    {
        name: 'anime.min.js',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js'
    },
    {
        name: 'lottie.min.js',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js'
    },
    {
        name: 'OrbitControls.js',
        url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/js/controls/OrbitControls.js'
    },
    {
        name: 'three.min.js',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    },
    {
        name: 'lenis.min.js',
        url: 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js'
    },
    {
        name: 'gsap.min.js',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
    },
    {
        name: 'ScrollTrigger.min.js',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
    },
    {
        name: 'lucide.min.js',
        url: 'https://unpkg.com/lucide@latest'
    }
];

const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchCss(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': userAgent
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = (targetUrl) => {
            https.get(targetUrl, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    let redirectUrl = response.headers.location;
                    if (redirectUrl.startsWith('/')) {
                        const parsed = new URL(targetUrl);
                        redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
                    }
                    request(redirectUrl);
                    return;
                }
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download ${targetUrl}: ${response.statusCode}`));
                    return;
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(dest, () => {});
                reject(err);
            });
        };
        request(url);
    });
}

// Generate textured noise image using sharp
async function generateNoise() {
    try {
        const sharp = require('sharp');
        const width = 256;
        const height = 256;
        const buffer = Buffer.alloc(width * height * 4);
        for (let i = 0; i < buffer.length; i += 4) {
            // Greyscale values with a tiny bit of random color aberration
            const val = Math.floor(Math.random() * 255);
            buffer[i] = val;         // R
            buffer[i + 1] = val;     // G
            buffer[i + 2] = val;     // B
            buffer[i + 3] = 18;      // A (subtle transparency for matte overlay)
        }
        const noiseDest = path.join(__dirname, 'public', 'img', 'noise.png');
        await sharp(buffer, { raw: { width, height, channels: 4 } }).png().toFile(noiseDest);
        console.log(`Successfully generated premium noise PNG at: ${noiseDest}`);
    } catch (err) {
        console.error('Failed to generate noise texture using sharp:', err.message);
    }
}

async function run() {
    console.log('--- STARTING ASSET DOWNLOAD ENGINE ---');
    
    // 1. Download libraries
    for (const lib of libs) {
        const dest = path.join(__dirname, 'public', 'lib', lib.name);
        try {
            await downloadFile(lib.url, dest);
            console.log(`Downloaded library: ${lib.name}`);
        } catch (err) {
            console.error(`Error downloading library ${lib.name}:`, err.message);
        }
    }

    // 2. Generate noise PNG
    await generateNoise();

    // 3. Download Google Fonts and create local font CSS
    try {
        console.log('Fetching Google Fonts stylesheet...');
        const cssData = await fetchCss(googleFontsUrl);
        
        // Split by blocks and keep latin only
        const blocks = cssData.split('}');
        let localCss = '';
        let fontIndex = 0;

        for (const block of blocks) {
            if (!block.trim()) continue;
            
            // Check if it is a latin block
            if (block.includes('/* latin */')) {
                const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/s\/[^)]+)\)/);
                const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/);
                const weightMatch = block.match(/font-weight:\s*(\d+)/);
                const styleMatch = block.match(/font-style:\s*([^;]+)/);

                if (urlMatch && familyMatch && weightMatch) {
                    const remoteUrl = urlMatch[1];
                    const family = familyMatch[1];
                    const weight = weightMatch[1];
                    const style = styleMatch ? styleMatch[1].trim() : 'normal';

                    // Clean font name for local saving
                    const sanitizedFamily = family.replace(/\s+/g, '');
                    const localFileName = `${sanitizedFamily}-${weight}-${style}-${fontIndex}.woff2`;
                    const localFilePath = path.join(__dirname, 'public', 'fonts', localFileName);

                    console.log(`Downloading font: ${family} (${weight}, ${style})...`);
                    await downloadFile(remoteUrl, localFilePath);
                    console.log(`Saved font file: ${localFileName}`);

                    // Create local CSS block
                    let localBlock = block;
                    // Replace remote url with local url
                    localBlock = localBlock.replace(/url\(https:\/\/fonts\.gstatic\.com\/s\/[^)]+\)/, `url('/fonts/${localFileName}')`);
                    localCss += localBlock + '}\n';
                    fontIndex++;
                }
            }
        }

        fs.writeFileSync(path.join(__dirname, 'public', 'fonts', 'fonts.css'), localCss);
        console.log('Successfully created local fonts.css stylesheet.');

    } catch (err) {
        console.error('Error processing fonts:', err.message);
    }

    console.log('--- ASSET DOWNLOAD ENGINE COMPLETE ---');
}

run();
