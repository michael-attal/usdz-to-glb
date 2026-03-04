# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2024-01-01

### Added

- Initial release.
- `convertUsdzToGlb(buffer)` — single-function public API.
- **USDZ unpacker** — handles STORED (method 0) and DEFLATE (method 8) ZIP entries; walks local file headers sequentially without requiring the central directory.
- **USDA parser** — full tokenizer + recursive-descent parser for the ASCII USD text format. Supports `def Mesh`, `def Material`, `def Shader` prims; `xformOp:translate`, `xformOp:scale`, `xformOp:transform`; `material:binding` relationships; `UsdPreviewSurface` inputs (`diffuseColor`, `roughness`, `metallic`, file texture `inputs:file`).
- **USDC parser** — binary PXR-USDC crate format parser. Reads TOKENS, STRINGS, FIELDS, FIELDSETS, PATHS, and SPECS sections; decodes LZ4-compressed sections; reconstructs the prim tree to extract geometry and materials.
- **LZ4 decompressor** — pure-JavaScript LZ4 block decompressor (no native addon required).
- **GLB builder** — glTF 2.0 compliant binary builder: polygon fan triangulation, UV-flip (USD bottom-left → glTF top-left origin), world-transform baking, PBR material output with embedded textures, index width optimization (UNSIGNED_SHORT when possible).
- **CLI** (`usdz-to-glb`) — converts a `.usdz` file to `.glb` from the command line.
- Multi-layer archive support: all `.usda`/`.usdc` layers in the archive are parsed and merged, enabling correct conversion of Apple RoomPlan exports.

[0.1.0]: https://github.com/energyi/usdz-to-glb/releases/tag/v0.1.0
