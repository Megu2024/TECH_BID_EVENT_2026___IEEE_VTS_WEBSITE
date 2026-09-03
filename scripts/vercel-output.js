/**
 * This script creates the Vercel Build Output API (v3) directory structure.
 * It copies the Vite static build output and the serverless API function
 * into the correct .vercel/output/ structure so Vercel deploys both
 * the static frontend AND the Node.js serverless backend.
 * 
 * See: https://vercel.com/docs/build-output-api/v3
 */

const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", ".vercel", "output");

// Clean and create output structure
if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
}

fs.mkdirSync(path.join(OUTPUT_DIR, "static"), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, "functions", "api", "index.func"), { recursive: true });

// 1. Write config.json
const config = {
    version: 3,
    routes: [
        { src: "/api/(.*)", dest: "/api/index" },
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index.html" },
    ],
};
fs.writeFileSync(
    path.join(OUTPUT_DIR, "config.json"),
    JSON.stringify(config, null, 2)
);

// 2. Copy client/dist into static/
const clientDist = path.join(__dirname, "..", "client", "dist");
copyDirSync(clientDist, path.join(OUTPUT_DIR, "static"));

// 3. Create the serverless function bundle
const funcDir = path.join(OUTPUT_DIR, "functions", "api", "index.func");

// Copy the entire server/ directory into the function
copyDirSync(
    path.join(__dirname, "..", "server"),
    path.join(funcDir, "server"),
    ["node_modules"]
);

// Copy api/index.js (the entry point)
fs.copyFileSync(
    path.join(__dirname, "..", "api", "index.js"),
    path.join(funcDir, "index.js")
);

// Copy node_modules from root (contains the server dependencies)
const rootNodeModules = path.join(__dirname, "..", "node_modules");
if (fs.existsSync(rootNodeModules)) {
    copyDirSync(rootNodeModules, path.join(funcDir, "node_modules"));
}

// Write .vc-config.json for the function
const vcConfig = {
    runtime: "nodejs20.x",
    handler: "index.js",
    launcherType: "Nodejs",
    maxDuration: 30,
    regions: ["bom1"],
};
fs.writeFileSync(
    path.join(funcDir, ".vc-config.json"),
    JSON.stringify(vcConfig, null, 2)
);

console.log("✅ Vercel Build Output created successfully!");
console.log(`   Static files: ${OUTPUT_DIR}/static/`);
console.log(`   Function: ${OUTPUT_DIR}/functions/api/index.func/`);

// ---- Helper ----
function copyDirSync(src, dest, exclude = []) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (exclude.includes(entry.name)) continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath, exclude);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
