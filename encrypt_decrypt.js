const CryptoJS = require("crypto-js");
const secret = 'shezhuansauce';

module.exports.encrypt = function (text) {
    var ciphertext = CryptoJS.AES.encrypt(text, secret).toString();
    return ciphertext;
}

module.exports.decrypt = function (text) {
    var bytes = CryptoJS.AES.decrypt(text, secret);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText
}



