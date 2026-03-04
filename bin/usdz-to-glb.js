#!/usr/bin/env node
"use strict";

const fs   = require("fs");
const path = require("path");
const { convertUsdzToGlb } = require("../dist/index.js");

const [,, input, output] = process.argv;

if (!input) {
  console.error("Usage: usdz-to-glb <input.usdz> [output.glb]");
  process.exit(1);
}

const inputPath  = path.resolve(input);
const outputPath = output
  ? path.resolve(output)
  : inputPath.replace(/\.usdz$/i, ".glb");

if (!fs.existsSync(inputPath)) {
  console.error(`Error: file not found: ${inputPath}`);
  process.exit(1);
}

try {
  const usdzBuffer = fs.readFileSync(inputPath);
  const glbBuffer  = convertUsdzToGlb(usdzBuffer);
  fs.writeFileSync(outputPath, glbBuffer);
  const kb = (glbBuffer.length / 1024).toFixed(1);
  console.log(`✓ ${path.basename(outputPath)} (${kb} KB)`);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
