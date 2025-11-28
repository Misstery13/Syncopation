import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = 'https://syncopation-eight.vercel.app/';
const outputPath = path.resolve(__dirname, '../public/assets/images/qr-code.png');

console.log(`Generating QR Code for: ${url}`);

QRCode.toFile(outputPath, url, {
    color: {
        dark: '#000000',  // Blue dots
        light: '#0000' // Transparent background
    },
    width: 300
}, function (err) {
    if (err) throw err;
    console.log(`QR Code saved to: ${outputPath}`);
});
