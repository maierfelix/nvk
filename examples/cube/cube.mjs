const positions = new Float32Array([
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,
  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,
  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,
  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,
  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,
  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0
]);

const normals = new Float32Array([
  // Front
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
  // Back
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,
  // Top
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
  // Bottom
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,
  // Right
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
  // Left
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0
]);

const uvs = new Float32Array([
  // Front
   0.025,  0.01,
   0.175,  0.01,
   0.175,  0.175,
   0.025,  0.175,
  // Back
   0.0,  0.0,
   1.0,  0.0,
   1.0,  1.0,
   0.0,  1.0,
  // Top
   1.0,  0.0,
   1.0, -1.0,
   0.0, -1.0,
   0.0,  0.0,
  // Bottom
   0.0,  0.0,
   1.0,  0.0,
   1.0, -1.0,
   0.0, -1.0,
  // Right
   0.0,  0.0,
  -1.0,  0.0,
  -1.0, -1.0,
   0.0, -1.0,
  // Left
   1.0,  0.0,
   1.0, -1.0,
   0.0, -1.0,
   0.0,  0.0
]);

const indices = new Uint16Array([
  0,  1,  2,
  2,  3,  0,
  4,  5,  6,
  6,  7,  4,
  8,  9,  10,
  10, 11, 8,
  12, 13, 14,
  14, 15, 12,
  16, 17, 18,
  18, 19, 16,
  20, 21, 22,
  22, 23, 20
]);

let mesh = new Float32Array(positions.length + normals.length + uvs.length);
for (let ii = 0; ii < mesh.length; ++ii) {
  let offset8 = ii * 8;
  let offset3 = ii * 3;
  let offset2 = ii * 2;
  mesh[offset8 + 0] = positions[offset3 + 0];
  mesh[offset8 + 1] = positions[offset3 + 1];
  mesh[offset8 + 2] = positions[offset3 + 2];
  mesh[offset8 + 3] = normals[offset3 + 0];
  mesh[offset8 + 4] = normals[offset3 + 1];
  mesh[offset8 + 5] = normals[offset3 + 2];
  mesh[offset8 + 6] = uvs[offset2 + 0];
  mesh[offset8 + 7] = uvs[offset2 + 1];
};

class Cube {
  constructor() {}
};

Cube.prototype.getMesh = function() {
  return mesh;
};

Cube.prototype.getIndices = function() {
  return indices;
};

export default Cube;
