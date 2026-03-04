/**
 * Minimal DEFLATE raw-inflate using Node.js built-in zlib.
 * Only used for ZIP entries that use method=8 (DEFLATED).
 * USDC sections use LZ4, not DEFLATE.
 */
import { inflateRawSync } from "zlib";

export function inflateRaw(compressed: Uint8Array, _expectedSize: number): Uint8Array {
  return inflateRawSync(compressed);
}
