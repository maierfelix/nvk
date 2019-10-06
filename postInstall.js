const fs = require('fs');
const vkversion = '1.1.121';
fs.symlinkSync(`./generated/${vkversion}/${process.platform}/index.d.ts`, './index.d.ts');