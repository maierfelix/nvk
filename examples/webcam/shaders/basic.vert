#version 450
#extension GL_ARB_separate_shader_objects : enable

precision highp float;

out gl_PerVertex {
	vec4 gl_Position;
};

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec3 aVertexNormal;
layout (location = 2) in vec2 aTextureCoord;

layout (location = 0) out vec3 vSurfaceNormal;
layout (location = 1) out vec3 vCameraPosition;
layout (location = 2) out vec3 vLightPosition;
layout (location = 3) out vec3 vPosition;
layout (location = 4) out vec2 vTextureCoord;
layout (location = 5) out vec2 vMaterial;

layout (binding = 0) uniform UBO {
  mat4 model;
  mat4 view;
  mat4 projection;
  vec3 lightPosition;
  vec3 cameraPosition;
  vec2 material;
} ubo;

void main() {
  vec4 vertexPosition = ubo.projection * ubo.view * ubo.model * vec4(aVertexPosition, 1.0);
  vec3 worldPosition = vec3(ubo.model * vec4(aVertexPosition, 1.0));
  vec3 surfaceNormal = mat3(ubo.model) * aVertexNormal;
  vec3 lightPosition = ubo.lightPosition - worldPosition.xyz;
	gl_Position = vertexPosition;
  vSurfaceNormal = surfaceNormal;
  vCameraPosition = ubo.cameraPosition;
  vLightPosition = ubo.lightPosition;
  vPosition = worldPosition.xyz;
  vTextureCoord = aTextureCoord;
  vMaterial = ubo.material;
}
