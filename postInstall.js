const fs = require('fs');
const vkversion = '1.1.114';
fs.unlinkSync('./index.d.ts');
fs.symlinkSync(`./generated/${vkversion}/${process.platform}/index.d.ts`, './index.d.ts');