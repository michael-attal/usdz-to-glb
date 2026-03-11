/**
 * usdz-to-glb — public API
 *
 * Usage:
 *   import { convertUsdzToGlb } from "usdz-to-glb";
 *   const glb = convertUsdzToGlb(fs.readFileSync("model.usdz"));
 *   fs.writeFileSync("model.glb", glb);
 */

import { execSync }          from "child_process";
import * as fs               from "fs";
import * as os               from "os";
import * as path             from "path";
import { unpackUSDZ }        from "./parsers/usdz";
import { parseUSDA }         from "./parsers/usda";
import { parseUSDC }         from "./parsers/usdc";
import { buildGlb }          from "./builders/glb";
import { UsdScene, UsdMaterial } from "./parsers/usd-types";

export type { UsdScene }     from "./parsers/usd-types";
export type { UsdMesh }      from "./parsers/usd-types";
export type { UsdMaterial }  from "./parsers/usd-types";

/**
 * Try to convert a USDC binary buffer to USDA text using the `usdcat` CLI.
 * Returns the USDA text on success, or null if usdcat is not available.
 */
function tryUsdcatConvert(usdcData: Uint8Array): string | null {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "usdz-to-glb-"));
  const tmpUsdc = path.join(tmpDir, "input.usdc");
  try {
    fs.writeFileSync(tmpUsdc, usdcData);
    const result = execSync(`usdcat --flatten "${tmpUsdc}"`, {
      encoding: "utf-8",
      maxBuffer: 100 * 1024 * 1024, // 100 MB max output
      timeout: 30_000,              // 30 second timeout
    });
    if (result && result.length > 0) {
      console.log(`[usdz-to-glb] usdcat converted USDC to USDA (${result.length} chars)`);
      return result;
    }
    return null;
  } catch (err) {
    console.log(`[usdz-to-glb] usdcat not available or failed, falling back to built-in USDC parser: ${err}`);
    return null;
  } finally {
    // Clean up temp files
    try { fs.unlinkSync(tmpUsdc); } catch {}
    try { fs.rmdirSync(tmpDir); } catch {}
  }
}

/**
 * Convert a USDZ buffer to a GLB buffer.
 *
 * @param usdzBuffer - Raw bytes of the .usdz file (a ZIP archive).
 * @returns Raw bytes of the resulting .glb file.
 */
export function convertUsdzToGlb(usdzBuffer: Uint8Array | Buffer): Uint8Array {
  const buf = usdzBuffer instanceof Buffer
    ? new Uint8Array(usdzBuffer.buffer, usdzBuffer.byteOffset, usdzBuffer.byteLength)
    : usdzBuffer;

  const entries = unpackUSDZ(buf);
  if (entries.length === 0) throw new Error("usdz-to-glb: archive is empty");

  const assets = new Map<string, Uint8Array>();
  for (const entry of entries) {
    const ext = entry.filename.split(".").pop()?.toLowerCase();
    if (ext !== "usda" && ext !== "usdc") {
      assets.set(entry.filename, entry.data);
      const base = entry.filename.split("/").pop()!;
      assets.set(base, entry.data);
    }
  }

  // Parses every USD layer in the archive and merge meshes + materials.
  // This handles RoomPlan-style USDZ files where geometry is split across
  // many referenced sub-layers rather than inlined in the root.
  const merged: UsdScene = {
    format: "usda",
    upAxis: "Y",
    metersPerUnit: 1.0,
    meshes: [],
    materials: new Map<string, UsdMaterial>(),
    textures: assets,
  };

  for (const entry of entries) {
    const ext = entry.filename.split(".").pop()?.toLowerCase();
    if (ext !== "usda" && ext !== "usdc") continue;

    let scene: UsdScene;
    try {
      if (ext === "usda") {
        const text = new TextDecoder().decode(entry.data);
        scene = parseUSDA(text, assets);
      } else {
        // Try usdcat first (reliable, handles all USDC versions),
        // fall back to the built-in USDC parser if unavailable.
        const usdaText = tryUsdcatConvert(entry.data);
        if (usdaText) {
          scene = parseUSDA(usdaText, assets);
        } else {
          scene = parseUSDC(entry.data, assets);
        }
      }
    } catch (err) {
      console.log(`[usdz-to-glb] Failed to parse ${entry.filename}: ${err}`);
      continue;
    }

    for (const mesh of scene.meshes) merged.meshes.push(mesh);
    for (const [k, v] of scene.materials) merged.materials.set(k, v);
    if (scene.upAxis) merged.upAxis = scene.upAxis;
    if (scene.metersPerUnit) merged.metersPerUnit = scene.metersPerUnit;
  }

  console.log(`[usdz-to-glb] Merged scene: ${merged.meshes.length} meshes, ${merged.materials.size} materials`);
  return buildGlb(merged);
}
