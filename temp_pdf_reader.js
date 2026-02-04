const fs = require('fs');
const pdf = require('pdf-parse');

const files = ['./informacije/Seminarski rad_template.pdf'];

async function readPdf(file) {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        return;
    }
    console.log(`\nReading ${file}...`);
    const dataBuffer = fs.readFileSync(file);
    try {
        const data = await pdf(dataBuffer);
        console.log(`Total pages: ${data.numpages}`);
        console.log('\n--- TEXT CONTENT ---');
        // Print first 2000 chars to get header/structure info
        console.log(data.text.substring(0, 2000));

    } catch (e) {
        console.error(`Error reading ${file}:`, e);
    }
}

(async () => {
    for (const f of files) {
        await readPdf(f);
    }
})();
