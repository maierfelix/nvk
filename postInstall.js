const fs = require('fs');
const vkversion = '1.1.114';
try {
  fs.unlinkSync('./index.d.ts');
} catch (e) { }
try {
  fs.symlinkSync(`./generated/${vkversion}/${process.platform}/index.d.ts`, './index.d.ts');
} catch (e) { }