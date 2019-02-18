/**

  Applies various patches to the AST including:
   - Fixes for specifications
   - Code behavior changes for a more JS conform usage

**/
export default function(ast) {

  let structs = ast.filter(node => node.kind === "STRUCT");

  structs.map(struct => {

    // PATCH:
    // memoryTypes, memoryHeaps
    // to reflect them we need to read from a dynamic length
    // the dynamic length gets attached to the AST node here
    {
      let patches = 0;
      struct.children.map(member => {
        if (member.name === "memoryHeaps") {
          member.dynamicLength = "memoryHeapCount";
          patches++;
        }
        if (member.name === "memoryTypes") {
          member.dynamicLength = "memoryTypeCount";
          patches++;
        }
      });
      if (patches > 0 && patches !== 2) {
        console.error(`Expected patch count of 2 but got ${patches}`);
      }
    }

    // PATCH:
    // Allows shaders to be loaded as Uint8Array
    {
      let patches = 0;
      if (struct.name === "VkShaderModuleCreateInfo") {
        struct.children.map(member => {
          if (member.name === "pCode") {
            // haxxxxx
            member.jsTypedArrayName = "Uint8Array";
            patches++;
          }
        });
      }
      if (patches > 0 && patches !== 1) {
        console.error(`Expected patch count of 1 but got ${patches}`);
      }
    }

  });

};
