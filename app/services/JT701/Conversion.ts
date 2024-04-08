import { IJT701Data, ISensorData, ParserUtil } from "./ParserUtil";
import { hexStr2Byte } from "./CommonUtil";
import TrakingHistory, { GpsDeviceType } from "../../schema/TrakingHistory";

export class JT701 {
  // call to start converting data
  static async receiveData(packet: any) {
    try {
      const bytes = hexStr2Byte(packet);
      const msgBodyBuf = Buffer.from(bytes);
      return await this.decodeData(msgBodyBuf);
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  /**
   * Parse ByteBuf raw data
   * @param {Buffer} inBuf
   * @return {Object}
   */
  static async decodeData(inBuf: Buffer) {
    let decoded:IJT701Data;
    console.log(inBuf);
    const header = Number(inBuf.readUInt8(0)?.toString(16));
    console.log(header, "=-=-=header=-=-=");
    if (header == 28) {
      //Constant.TEXT_MSG_HEADER 28
      inBuf.readUInt8(); // Skip header
      decoded = ParserUtil.decodeTextMessage(inBuf);
    } else if (header == 24) {
      //Constant.BINARY_MSG_HEADER 24
      inBuf.readUInt8(); // Skip header
      decoded = ParserUtil.decodeBinaryMessage(inBuf);
    } else {
      return null;
    }
    console.log(JSON.stringify(decoded), "=-=--=");
    await this.formatJT701Data(decoded);
    return JSON.stringify(decoded);
  }

  static async formatJT701Data(data: IJT701Data) {
    const decodedData = data.DataBody;
    let payload = {
      deviceType: GpsDeviceType.JT701,
      imeiNumber: decodedData?.imei,
      dateTime: decodedData?.dateTime,
      lattitude: decodedData?.latitude,
      longitude: decodedData?.longitude,
      altitude: decodedData?.direction,
      angle: decodedData?.direction,
      speed: decodedData?.speed,
      other : {
        gpsTime: decodedData?.gpsTime,
        locationType: decodedData?.locationType,
        sensorID: decodedData?.sensorID,
        lockStatus: decodedData?.lockStatus,
        lockRope: decodedData?.lockRope,
        lockTimes: decodedData?.lockTimes,
        index: decodedData?.index,
        voltage: decodedData?.voltage,
        power: decodedData?.power,
        RSSI: decodedData?.RSSI,
        SensorType: decodedData?.SensorType,
        Temperature: decodedData?.Temperature,
        Humidity: decodedData?.Humidity,
        event: decodedData?.event,
        vehicleID:decodedData?.vehicleID,
        protocolType:decodedData?.protocolType,
        deviceType: decodedData?.deviceType,
        dataType: decodedData?.dataType,
        dataLength: decodedData?.dataLength,
        mileage: decodedData?.mileage,
        gpsSignal: decodedData?.gpsSignal,
        gsmSignal: decodedData?.gsmSignal,
        alarmArea: decodedData?.alarmArea,
        battery: decodedData?.battery,
        backCover: decodedData?.backCover,
        mcc: decodedData?.mcc,
        mnc: decodedData?.mnc,
        lac: decodedData?.lac,
        cellID: decodedData?.cellID,
        alarm:  decodedData?.alarm,
        rfidNo: decodedData?.rfidNo,
        status: decodedData?.status,
        psdErrorTimes: decodedData?.psdErrorTimes,
        unlockFenceID: decodedData?.unlockFenceID,
      }
    }
    console.log(payload);
    await TrakingHistory.create(payload);
    return payload;
  }
}
