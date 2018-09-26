#version 450
#extension GL_ARB_separate_shader_objects : enable

layout (location = 0) in vec3 vSurfaceNormal;
layout (location = 1) in vec3 vCameraPosition;
layout (location = 2) in vec3 vLightPosition;
layout (location = 3) in vec2 vTextureCoord;

layout (location = 0) out vec4 fragColor;

layout (binding = 1) uniform sampler2D uDiffuseTexture;

void main() {
  vec3 color = vec3(1, 0, 0);
  color = texture(uDiffuseTexture, vTextureCoord).rgb;
  vec3 N = normalize(vSurfaceNormal);
  vec3 V = normalize(vCameraPosition);
  vec3 L = normalize(vLightPosition);
  vec3 ambient = color * 0.1;
  vec3 diffuse = max(dot(L, N), 0.0) * color;
  fragColor = vec4(ambient + diffuse, 1.0);
}
