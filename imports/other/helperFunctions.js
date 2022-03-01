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



  const decryptStringWithXORtoHex = (text, key) => {
    let c = "";
    let usedKey = key;

    while (usedKey.length < (text.length/2)) {
         usedKey += usedKey;
    }

    for (var j = 0; j < text.length; j = j+2) {
      let hexValueString = text.substring(j, j+2);

      let value1 = parseInt(hexValueString, 16);
      let value2 = usedKey.charCodeAt(j/2);

      let xorValue = value1 ^ value2;
      c += String.fromCharCode(xorValue) + "";
    }

    return c;
  }

export  async function checkSecretKey(exportedPublicKey, exportedPrivateKey, secretKey){
    const controlText = "The secret key is correct.";

    // encrypt controlText with PuK
    const importedPublicKey = await window.crypto.subtle.importKey(
          "spki",
          str2ab(window.atob(exportedPublicKey)),
            {
              name: "RSA-OAEP",
              hash: "SHA-256"
            },
          true,
          ["encrypt"]
        );

    let enc = new TextEncoder();
    const encryptedControlText = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      importedPublicKey,
      enc.encode( controlText )
    );

    //decrypt control text with PrK
    const privateKey =   decryptStringWithXORtoHex(exportedPrivateKey, secretKey);

    try {
      const importedPrivateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        str2ab(window.atob(privateKey)),
          {
            name: "RSA-OAEP",
            hash: "SHA-256"
          },
        true,
        ["decrypt"]
      );

      const decryptedControlText = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
          importedPrivateKey,
          encryptedControlText,
        );

        let dec = new TextDecoder();
        const decodedControlText = dec.decode(decryptedControlText);

      return controlText === decodedControlText;
    } catch (e){
      return false;
    }
  }

  export async function generateKeyPairForUser(){
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

  export async function generateKey(){
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
export async function importKeyAndEncrypt(key, encrypttionType, textToEncrypt, algorithm = null){
        let exportedKey = key;
        if (encrypttionType === "sync"){
          if (typeof key === "string"){
            exportedKey = new Uint8Array(atob(key).split(','));
          }
        } else {
          if (typeof key === "string"){
            exportedKey = str2ab(window.atob(key));
          }
        }

        let importAlgorithm = algorithm ? {...algorithm} : {};
        let ecryptAlgorithm = algorithm ? {...algorithm} : {};
        let usedEncryptionType = "raw";
        let usages = ["encrypt", "decrypt"];

        if (encrypttionType === "async"){
          importAlgorithm = {
            name: "RSA-OAEP",
            hash: "SHA-256"
          };
          ecryptAlgorithm = {
            name: "RSA-OAEP",
          };
          usedEncryptionType = "spki";
          usages = ["encrypt"];
        }

        const importedKey = await window.crypto.subtle.importKey(
              usedEncryptionType,
              exportedKey,
              importAlgorithm,
              true,
              usages
            );

        let enc = new TextEncoder();
        const encryptedText = await window.crypto.subtle.encrypt(
          ecryptAlgorithm,
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
  export async function importKeyAndDecrypt(key, encrypttionType, textToDecrypt, algorithm = null){
    let exportedKey = key;
    if (encrypttionType === "sync"){
      if (typeof key === "string"){
        exportedKey = new Uint8Array(atob(key).split(','))
      }
    } else {
      if (typeof key === "string"){
        exportedKey = str2ab(window.atob(key));
      }
    }

    let importAlgorithm = algorithm ? {...algorithm} : {};
    let decryptAlgorithm = algorithm ? {...algorithm} : {};
    let usedEncryptionType = "raw";
    let usages = ["encrypt", "decrypt"];

    if (encrypttionType === "async"){
      importAlgorithm = {
        name: "RSA-OAEP",
        hash: "SHA-256"
      };
      decryptAlgorithm = {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      };
      usedEncryptionType = "pkcs8";
      usages = ["decrypt"];
    }

        const importedKey = await window.crypto.subtle.importKey(
              usedEncryptionType,
              exportedKey,
              importAlgorithm,
              true,
              usages
            );

        const decryptedText = await window.crypto.subtle.decrypt(
          decryptAlgorithm,
          importedKey,
          str2ab(window.atob(textToDecrypt)),
        );

        let dec = new TextDecoder();
        return dec.decode(decryptedText);
      }
