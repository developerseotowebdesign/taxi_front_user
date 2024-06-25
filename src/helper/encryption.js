const CryptoJS = window.CryptoJS;

// Function to pad the plaintext
  function pkcs5_pad(text, blocksize) {
    var padding = blocksize - (text.length % blocksize);
    for (var i = 0; i < padding; i++) {
      text += String.fromCharCode(padding);
    }
    return text;
  }

  // Function to encrypt plaintext
  function encrypt(plainText, key) {
    // Convert key to MD5 and then to binary
    var secretKey = CryptoJS.enc.Hex.parse(CryptoJS.MD5(key).toString(CryptoJS.enc.Hex));
    // Initialize the initialization vector
    var initVector = CryptoJS.enc.Utf8.parse(Array(16).fill(0).map((_, i) => String.fromCharCode(i)).join(''));
    // Pad the plaintext
    var plainPad = pkcs5_pad(plainText, 16);
    // Encrypt using AES-128 in CBC mode
    var encryptedText = CryptoJS.AES.encrypt(plainPad, secretKey, { iv: initVector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding });
    // Convert the ciphertext to hexadecimal
    return encryptedText.ciphertext.toString(CryptoJS.enc.Hex);
  }

  // Function to decrypt ciphertext
  function decrypt(encryptedText, key) {
    // Convert key to MD5 and then to binary
    var secretKey = CryptoJS.enc.Hex.parse(CryptoJS.MD5(key).toString(CryptoJS.enc.Hex));
    // Initialize the initialization vector
    var initVector = CryptoJS.enc.Utf8.parse(Array(16).fill(0).map((_, i) => String.fromCharCode(i)).join(''));
    // Convert the encryptedText from hexadecimal to binary
    var encryptedData = CryptoJS.enc.Hex.parse(encryptedText);
    // Decrypt using AES-128 in CBC mode
    var decryptedText = CryptoJS.AES.decrypt({ ciphertext: encryptedData }, secretKey, { iv: initVector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding });
    // Remove PKCS#5 padding
    return decryptedText.toString(CryptoJS.enc.Utf8).replace(/[\x00-\x1F\x80-\xFF]+$/g, '');
  }

  export { encrypt, decrypt };

