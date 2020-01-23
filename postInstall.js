const fs = require('fs');
const vkversion = '1.1.126';

try {
  fs.unlinkSync('./platform-types');
} catch (e) { }
try {
  fs.symlinkSync(`./generated/${vkversion}/${process.platform}/`, './platform-types', 'junction');
} catch (e) { }