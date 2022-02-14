export const isEmail = ( email ) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email,
  );

export const uint8ArrayToImg = ( arr ) => {
  const blob = new Blob( [ arr ], {
    type: "image/jpeg"
  } );
  const img = URL.createObjectURL( blob );
  return img;
};

export function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

export function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


  async function generateKeyPairForUser(){
      let keyPair = null;
      await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      )
      .then(function(pair){
        keyPair = pair;
      })
      .catch(function(err){
        console.error(err);
      });
      return keyPair;
    }

  async function generateKey(){
        return window.crypto.subtle.generateKey(
          {
          name: "AES-GCM",
          length: 256
          },
            true,
            ["encrypt", "decrypt"]
        );
      }

      /*
      key - string or ab
      encrypttionType - "async" or "sync"
      algorithm - object
      textToEncrypt - string
      */
      async function importKeyAndEncrypt(key, encrypttionType, algorithm, textToEncrypt){
        let exportedKey = key;
        if (encrypttionType === "sync"){
          if (typeof key === "string"){
            exportKey = new Uint8Array(atob(key).split(','))
          }
        } else {
          if (typeof key === "string"){
            exportedKey = str2ab(window.atob(key));
          }
        }

        const importedKey = await window.crypto.subtle.importKey(
              (encrypttionType === "sync" ? "raw" : "spki"),
              exportedKey,
              algorithm,
              true,
              (encrypttionType === "sync" ? ["encrypt", "decrypt"] : ["encrypt"])
            );

        let enc = new TextEncoder();
        const encryptedText = await window.crypto.subtle.encrypt(
          algorithm,
          importedKey,
          enc.encode( textToEncrypt )
        );

        return window.btoa(ab2str(encryptedText));
      }

      /*
      key - string or ab
      encrypttionType - "async" or "sync"
      algorithm - object
      textToEncrypt - string
      */
      async function importKeyAndDecrypt(key, decrypttionType, algorithm, textToDecrypt){
        let exportedKey = key;
        if (encrypttionType === "sync"){
          if (typeof key === "string"){
            exportKey = new Uint8Array(atob(key).split(','))
          }
        } else {
          if (typeof key === "string"){
            exportedKey = str2ab(window.atob(key));
          }
        }

        const importedKey = await window.crypto.subtle.importKey(
              (encrypttionType === "sync" ? "raw" : "pkcs8"),
              exportedKey,
              algorithm,
              true,
              (encrypttionType === "sync" ? ["encrypt", "decrypt"] : ["decrypt"])
            );

        const decryptedText = await window.crypto.subtle.decrypt(
          algorithm,
          importedKey,
          str2ab(window.atob(textToDecrypt)),
        );

        let dec = new TextDecoder();
        const decodedDecryptedText = dec.decode(decryptedText);

        return decodedDecryptedText;
      }
