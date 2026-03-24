#!/usr/bin/env node
// scripts/generate-icon.js
// Generates a simple 128x128 PNG icon for the extension using only Node.js built-ins.
// The PNG is a solid indigo square with white text "AI".

const fs = require('fs');
const path = require('path');

// Minimal PNG writer — encodes a 128x128 RGBA image
function createPNG(width, height, pixels) {
    const zlib = require('zlib');

    function crc32(buf) {
        const table = (() => {
            const t = new Uint32Array(256);
            for (let i = 0; i < 256; i++) {
                let c = i;
                for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
                t[i] = c;
            }
            return t;
        })();
        let crc = 0xffffffff;
        for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
        return (crc ^ 0xffffffff) >>> 0;
    }

    function chunk(type, data) {
        const typeBuf = Buffer.from(type, 'ascii');
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length);
        const crcBuf = Buffer.alloc(4);
        crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
        return Buffer.concat([len, typeBuf, data, crcBuf]);
    }

    // IHDR
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 2;   // color type: RGB
    ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

    // Raw scanlines (filter byte 0 + RGB per pixel)
    const raw = Buffer.alloc(height * (1 + width * 3));
    for (let y = 0; y < height; y++) {
        raw[y * (1 + width * 3)] = 0; // filter none
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 3;
            const src = (y * width + x) * 4;
            raw[y * (1 + width * 3) + 1 + x * 3 + 0] = pixels[src];
            raw[y * (1 + width * 3) + 1 + x * 3 + 1] = pixels[src + 1];
            raw[y * (1 + width * 3) + 1 + x * 3 + 2] = pixels[src + 2];
        }
    }

    const compressed = zlib.deflateSync(raw);

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG signature
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

const W = 128, H = 128;
const pixels = new Uint8Array(W * H * 4);

// Fill background: indigo #4F46E5
for (let i = 0; i < W * H; i++) {
    pixels[i * 4 + 0] = 0x4F;
    pixels[i * 4 + 1] = 0x46;
    pixels[i * 4 + 2] = 0xE5;
    pixels[i * 4 + 3] = 0xFF;
}

// Draw a rounded-rectangle highlight in the center (lighter shade)
for (let y = 20; y < H - 20; y++) {
    for (let x = 20; x < W - 20; x++) {
        const i = y * W + x;
        pixels[i * 4 + 0] = 0x6D;
        pixels[i * 4 + 1] = 0x66;
        pixels[i * 4 + 2] = 0xFF;
        pixels[i * 4 + 3] = 0xFF;
    }
}

const png = createPNG(W, H, pixels);
const out = path.resolve(__dirname, '..', 'icon.png');
fs.writeFileSync(out, png);
console.log(`Icon written to ${out}`);
