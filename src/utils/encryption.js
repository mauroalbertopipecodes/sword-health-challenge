var crypto = require('crypto');

const aes = 'aes-256-cbc';
const iv = 'dd99fc75aed67d15';
const key = '7533845edaf8e3318472dd1b331a7ec2';

function encrypt(plaintext) {
  const cipher = crypto.createCipheriv(aes, Buffer.from(key), iv);
  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

function decrypt(ciphertext) {
  const decipher = crypto.createDecipheriv(aes, Buffer.from(key), iv);
  const encryptedDataBuffer = Buffer.from(ciphertext, 'hex');
  let decrypted = decipher.update(encryptedDataBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function parseJwt(token) {
  const decoded = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString(),
  );
  return decoded;
}
module.exports = { encrypt, decrypt, parseJwt };
