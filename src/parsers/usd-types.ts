/**
 * Shared USD scene-graph types.
 *
 * minimal types needed to represent USD geometry and materials
 * after parsing either USDA (text) or USDC (binary crate) format.
 */

export interface Vec2 { x: number; y: number }
export interface Vec3 { x: number; y: number; z: number }
export interface Vec4 { x: number; y: number; z: number; w: number }

export type Mat4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

/** A single geometric mesh extracted from a USD prim. */
export interface UsdMesh {
  name: string;
  /** World-space transform (column-major, identity if none). */
  transform: Mat4;
  /** Flat array of (x, y, z) triples — length = numPoints × 3. */
  points: Float32Array;
  /** Number of vertices per face (triangle = 3, quad = 4, etc.). */
  faceVertexCounts: Int32Array;
  /** Vertex index per corner, in face order. */
  faceVertexIndices: Int32Array;
  /** Per-vertex or per-face-varying normals, same length as points (optional). */
  normals?: Float32Array;
  /** UV texture coordinates, length = numUVs × 2 (optional). */
  uvs?: Float32Array;
  /** Index array into uvs[] for face-varying UVs (optional). */
  uvIndices?: Int32Array;
  /** Reference to a material prim path (optional). */
  materialPath?: string;
}

export interface UsdMaterial {
  name: string;
  primPath: string;
  /** Linear-space RGBA base color. */
  baseColor: Vec4;
  metallic: number;
  roughness: number;
  /** Path inside the USDZ archive for the diffuse texture (optional). */
  diffuseTexturePath?: string;
}

/** Top-level scene extracted from a USDZ archive. */
export interface UsdScene {
  /** Source format: "usda" | "usdc" */
  format: "usda" | "usdc";
  upAxis: "Y" | "Z";
  metersPerUnit: number;
  meshes: UsdMesh[];
  materials: Map<string, UsdMaterial>;
  /** Raw texture buffers keyed by the path inside the USDZ archive. */
  textures: Map<string, Uint8Array>;
}

export function identityMat4(): Mat4 {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

export function multiplyMat4(a: Mat4, b: Mat4): Mat4 {
  const out: number[] = new Array(16).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row + k * 4] * b[k + col * 4];
      }
      out[row + col * 4] = sum;
    }
  }
  return out as Mat4;
}
