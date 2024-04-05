/**
 * Unescaped text to transparently transmit data
 *
 * @param {Buffer} inBuf
 * @param {Buffer} frame
 * @param {number} bodyLen
 */
export const unescape = (inBuf:Buffer, frame:Buffer, bodyLen:number) => {
  let i = 0;
  while (i < bodyLen) {
      const b = inBuf.readUInt8();
      if (b === 0x3D) {
          const nextByte = inBuf.readUInt8();
          if (nextByte === 0x14) {
              frame.writeUInt8(0x3D ^ 0x14);
          } else if (nextByte === 0x15) {
              frame.writeUInt8(0x3D ^ 0x15);
          } else if (nextByte === 0x00) {
              frame.writeUInt8(0x3D ^ 0x00);
          } else if (nextByte === 0x11) {
              frame.writeUInt8(0x3D ^ 0x11);
          } else {
              frame.writeUInt8(b);
              frame.writeUInt8(nextByte);
          }
          i += 2;
      } else {
          frame.writeUInt8(b);
          i++;
      }
  }
}

/**
* remove last character from string
* @param {string} inStr input string
* @param {string} suffix characters to remove
* @return {string}
*/
export const trimEnd = (inStr:string, suffix:string) => {
  while (inStr.endsWith(suffix)) {
      inStr = inStr.substring(0, inStr.length - suffix.length);
  }
  return inStr;
}

/**
* Hexadecimal to Uint8Array
* @param {string} hex
* @return {Uint8Array}
*/
export const hexStr2Byte = (hex:any) =>  {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}
