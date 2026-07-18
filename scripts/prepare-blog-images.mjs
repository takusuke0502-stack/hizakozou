import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = process.cwd();
const sourceRoot = path.join(rootDir, "content", "assets", "blog");
const outputRoot = path.join(rootDir, "image", "blog");
const manifestPath = path.join(outputRoot, "image-manifest.json");
const widths = [480, 768, 1200];
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function prepareBlogImages({ slug = "" } = {}) {
  if (!(await pathExists(sourceRoot))) {
    console.log("No blog image source folder found. Add images under content/assets/blog/{slug}/ first.");
    return { processed: 0, manifest: {} };
  }

  const slugs = slug ? [slug] : await collectSlugDirectories();
  const manifest = slug ? await readManifest() : {};
  let processed = 0;

  for (const articleSlug of slugs) {
    validateSlug(articleSlug);
    const sourceDir = path.join(sourceRoot, articleSlug);
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
      .sort((left, right) => left.name.localeCompare(right.name, "en"));

    if (!files.length) continue;

    const outputDir = path.join(outputRoot, articleSlug);
    await fs.mkdir(outputDir, { recursive: true });

    for (const file of files) {
      const sourcePath = path.join(sourceDir, file.name);
      const image = sharp(sourcePath, { failOn: "warning" }).rotate();
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error(`画像サイズを取得できません: ${sourcePath}`);
      }
      if (metadata.width < widths.at(-1)) {
        throw new Error(`元画像の横幅は1200px以上にしてください: ${sourcePath} (${metadata.width}px)`);
      }

      const sourceStem = path.basename(file.name, path.extname(file.name));
      const outputStem = sourceStem.startsWith(`${articleSlug}-`) ? sourceStem : `${articleSlug}-${sourceStem}`;
      const variants = [];

      for (const width of widths) {
        const outputName = `${outputStem}-${width}.webp`;
        const outputPath = path.join(outputDir, outputName);
        const info = await sharp(sourcePath, { failOn: "warning" })
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toFile(outputPath);
        variants.push({ width: info.width, height: info.height, src: `/image/blog/${articleSlug}/${outputName}` });
      }

      const largest = variants.at(-1);
      manifest[largest.src] = {
        width: largest.width,
        height: largest.height,
        srcset: variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ")
      };
      processed += 1;
    }
  }

  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(sortManifest(manifest), null, 2)}\n`, "utf8");
  console.log(`Prepared ${processed} blog image(s) in 480px, 768px, and 1200px variants.`);
  return { processed, manifest: sortManifest(manifest) };
}

async function collectSlugDirectories() {
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a.localeCompare(b, "en"));
}

function validateSlug(value) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`画像フォルダ名は英小文字・数字・ハイフンだけにしてください: ${value}`);
  }
}

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function sortManifest(manifest) {
  return Object.fromEntries(Object.entries(manifest).sort(([left], [right]) => left.localeCompare(right, "en")));
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const slugIndex = argv.indexOf("--slug");
  return { slug: slugIndex >= 0 ? String(argv[slugIndex + 1] || "").trim() : "" };
}

const isCliRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCliRun) {
  await prepareBlogImages(parseArgs(process.argv.slice(2)));
}
