# usdz-to-glb

[![npm](https://img.shields.io/npm/v/usdz-to-glb)](https://www.npmjs.com/package/usdz-to-glb)
[![license](https://img.shields.io/npm/l/usdz-to-glb)](./LICENSE)
[![node](https://img.shields.io/node/v/usdz-to-glb)](https://nodejs.org)

Convert Apple USDZ files to GLB (binary glTF 2.0) — pure JavaScript, no native dependencies.

Handles both **USDA** (text) and **USDC** (binary crate) layers, including multi-layer archives such as those produced by Apple’s [RoomPlan](https://developer.apple.com/documentation/roomplan) API.

---

## Table of Contents

- [Features](#features)
- [Install](#install)
- [CLI](#cli)
- [API](#api)
- [Architecture](#architecture)
- [Limitations](#limitations)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Status |
|---------|--------|
| USDA (ASCII text USD) parsing | ✅ |
| USDC (binary PXR-USDC crate) parsing | ✅ |
| Multi-layer archives (e.g. RoomPlan) | ✅ |
| Mesh triangulation (tris, quads, n-gons) | ✅ |
| Per-vertex normals | ✅ |
| UV texture coordinates | ✅ |
| PBR materials (UsdPreviewSurface) | ✅ |
| Diffuse / albedo textures | ✅ |
| World-space transforms (translate, scale, matrix) | ✅ |
| DEFLATE-compressed ZIP entries | ✅ |
| LZ4-compressed USDC sections | ✅ |
| No native dependencies | ✅ |

---

## Install

```bash
npm install usdz-to-glb
```

---

## CLI

```bash
# Output written next to the input file as model.glb
npx usdz-to-glb model.usdz

# Explicit output path
npx usdz-to-glb model.usdz output.glb
```

---

## API

### `convertUsdzToGlb(buffer)`

```ts
import { convertUsdzToGlb } from "usdz-to-glb";
import { readFileSync, writeFileSync } from "fs";

const usdz = readFileSync("model.usdz");
const glb  = convertUsdzToGlb(usdz);
writeFileSync("model.glb", glb);
```

| Param | Type | Description |
|-------|------|-------------|
| `buffer` | `Uint8Array \| Buffer` | Raw bytes of the `.usdz` file |

Returns a `Uint8Array` containing the `.glb` binary.

### TypeScript types

The public types `UsdScene`, `UsdMesh`, and `UsdMaterial` are re-exported for advanced use-cases where you need to inspect the parsed scene:

```ts
import type { UsdScene, UsdMesh, UsdMaterial } from "usdz-to-glb";
```

---

## Architecture

```
usdz-to-glb
├── src/
│   ├── index.ts               — Public API: convertUsdzToGlb()
│   ├── parsers/
│   │   ├── usdz.ts            — ZIP unpacker (STORED + DEFLATE)
│   │   ├── usda.ts            — USDA (ASCII text) parser
│   │   ├── usdc.ts            — USDC (binary crate / PXR-USDC) parser
│   │   ├── usd-types.ts       — Shared scene-graph types (UsdMesh, UsdMaterial, …)
│   │   └── inflate.ts         — DEFLATE via Node.js built-in zlib
│   ├── utils/
│   │   └── lz4.ts             — Pure-JS LZ4 block decompressor
│   └── builders/
│       └── glb.ts             — glTF 2.0 / GLB binary builder
└── bin/
    └── usdz-to-glb.js         — CLI entry point
```

**Conversion pipeline:**

1. **Unpack** — the `.usdz` file is a ZIP archive; every entry (USD layers + textures) is extracted. Both STORED and DEFLATE compression methods are handled.
2. **Parse** — each `.usda` / `.usdc` layer is parsed into a `UsdScene` (meshes, materials, textures). All layers are merged so that multi-layer RoomPlan exports are handled correctly.
3. **Build** — the merged `UsdScene` is triangulated, world transforms are baked in, binary accessors are packed, and the result is assembled into a spec-compliant GLB envelope (glTF 2.0).

---

## Development

**Requirements:** Node.js ≥ 18

```bash
# Clone
git clone https://github.com/energyi/usdz-to-glb.git
cd usdz-to-glb

# Install dev dependencies (TypeScript only — no runtime deps)
npm install

# Build (outputs to dist/)
npm run build

# Watch mode during development
npm run dev

# Run tests
npm test
```

TypeScript sources live in `src/`; compiled output goes to `dist/`. The `bin/usdz-to-glb.js` CLI requires `dist/index.js` to be built first — run `npm run build` before using the CLI locally.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## License

[MIT](./LICENSE) © energyi
