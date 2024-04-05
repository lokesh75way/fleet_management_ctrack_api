export class NumberUtil {
  static getBitValue(val:number, bitData:number) {
      return (val >> bitData) & 1;
  }
}