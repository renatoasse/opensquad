const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dashboard", "dist");
const out = path.join(root, "squads", "_preview", "dashboard");

if (!fs.existsSync(dist)) {
  console.error("Dashboard dist not found. Run: cd dashboard && npm run build");
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

fs.mkdirSync(out, { recursive: true });
for (const name of fs.readdirSync(dist)) {
  const srcPath = path.join(dist, name);
  const destPath = path.join(out, name);
  if (fs.existsSync(destPath)) {
    if (fs.statSync(destPath).isDirectory()) {
      fs.rmSync(destPath, { recursive: true });
    } else {
      fs.unlinkSync(destPath);
    }
  }
  copyRecursive(srcPath, destPath);
}

console.log("Dashboard copiado para squads/_preview/dashboard");
