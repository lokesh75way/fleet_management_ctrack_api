import { Buffer } from "buffer";
import * as CommonUtil from "./CommonUtil";
import { EventTypeEnum, AlarmTypeEnum } from "./Enum";
import moment from "moment";
import { Constant } from "./Constant";
import { NumberUtil } from "./NumberUtil";

export interface ISensorData {
  gpsTime: string;
  latitude: number;
  longitude: number;
  locationType: number;
  speed: number;
  direction: number;
  sensorID: string;
  lockStatus: number;
  lockRope: number;
  lockTimes: number;
  index: any;
  voltage: number;
  power: any;
  RSSI: any;
  dateTime: any;
  SensorType: number;
  Temperature: number;
  Humidity: any;
  event: any;
  vehicleID:number;
  protocolType:number;
  deviceType:   number|null;
  dataType: number|null;
  dataLength: number|null;
  mileage: number|null;
  gpsSignal: number|null;
  gsmSignal: number|null;
  alarmArea: number|null;
  battery: number|null;
  backCover:    number;
  mcc:          number;
  mnc:          number;
  lac:          number;
  cellID:       number;
  imei:         string;
  alarm:        number;
  rfidNo: string | null;
  status: number;
  psdErrorTimes: number;
  unlockFenceID: number | null;
}

export interface IJT701Data {
  ReplyMsg: string | null;
  DeviceID: string | null;
  MsgType: string | null;
  DataBody: ISensorData | null;
}

/**
 * ParserUtil - Analysis method tool class
 */
export class ParserUtil {
  /**
   * Parse command response data
   * @param {Buffer} inBuf - rawdata
   * @returns {Result}
   */
  static decodeTextMessage(inBuf: Buffer) {
    const model: IJT701Data = {
      ReplyMsg: null,
      DeviceID: null,
      MsgType: null,
      DataBody: null,
    };
    inBuf.readUInt8(); // packet head
    console.log(inBuf.toString());
    const itemList = [];
    let msgBody = null;

    while (inBuf.length > 0) {
      if (
        itemList.length >= 6 &&
        itemList[3] === "WLNET" &&
        Constant.WLNET_TYPE_LIST.includes(itemList[4])
      ) {
        const lastItemLen = inBuf.length - 1;
        msgBody = Buffer.alloc(lastItemLen);
        CommonUtil.unescape(inBuf, msgBody, lastItemLen);
        inBuf.readUInt8(); // ")"
        console.log(inBuf.toString("ascii"), "=-=-=-=");
        break;
      } else {
        let index = inBuf.indexOf(","); //Constant.TEXT_MSG_SPLITER
        let itemLen = index > 0 ? index : inBuf.length - 1;
        let startInd = 0;
        if (inBuf.toString("ascii").startsWith("(")) {
          startInd = 1;
        }
        const byteArr = inBuf.subarray(startInd, itemLen);
        inBuf = inBuf.subarray(itemLen + 1); // +1 for ','
        itemList.push(byteArr.toString());
      }
    }

    let msgType = itemList[1];
    if (
      itemList.length >= 5 &&
      (itemList[3] === "WLNET" || itemList[3] === "OTA")
    ) {
      msgType = itemList[3] + itemList[4];
    }
    let dataBody = null;
    console.log(msgType);

    if (msgType === "WLNET5") {
      const sensorData = ParserUtil.parseWlnet5(msgBody);
      sensorData.imei = itemList[0];
      dataBody = sensorData;
      model.ReplyMsg = ParserUtil.replyMessageWLNET(msgType, sensorData.index);
    } else if (msgType === "P45") {
      dataBody = ParserUtil.parseP45(itemList);
      dataBody.imei = itemList[0];
      model.ReplyMsg = ParserUtil.replyMessage(msgType, itemList);
    } else {
      if (itemList.length > 0) {
        let data = "(" + itemList.join(",") + ")";
        console.log(data)
      }
    }
    model.DeviceID = itemList[0];
    model.MsgType = msgType;
    model.DataBody = dataBody;
    console.log(model, "=-=-");
    return model;
  }

  /**
   * Parse slave data
   * @param {Buffer} byteBuf
   * @returns {SensorData}
   */
  static parseWlnet5(byteBuf: any) {
    const sensorData: ISensorData = {
      gpsTime: "",
      latitude: 0,
      longitude: 0,
      locationType: 0,
      speed: 0,
      direction: 0,
      sensorID: "",
      lockStatus: 0,
      lockRope: 0,
      lockTimes: 0,
      index: null,
      voltage: 0,
      power: null,
      RSSI: null,
      dateTime: null,
      SensorType: 0,
      Temperature: 0,
      Humidity: null,
      event: null,
      vehicleID: 0,
      protocolType:0,
      deviceType:0,
      alarm:0,
      alarmArea:0,
      backCover:0,
      battery:0,
      cellID:0,
      dataLength:0,
      dataType:0,
      gpsSignal:0,
      gsmSignal:0,
      mcc:0,
      mnc:0,
      lac:0,
      imei:"",
      mileage:0,
      psdErrorTimes:0,
      rfidNo:"",
      status:0,
      unlockFenceID:0
    };

    // Positioning time
    const timeArr = byteBuf.subarray(0, 6);
    const bcdTimeStr = Buffer.from(timeArr).toString("hex");
    const gpsZonedDateTime = ParserUtil.parseBcdTime(bcdTimeStr);
    byteBuf = byteBuf.subarray(6); // Move buffer position

    // Latitude
    const latArr = byteBuf.subarray(0, 4);
    const latHexStr = Buffer.from(latArr).toString("hex");
    const latFloat =
      Number(latHexStr.substring(2, 4) + "." + latHexStr.substring(4)) /
      Number("60");
    let lat = Number(Number(latHexStr.substring(0, 2)) + latFloat);
    byteBuf = byteBuf.subarray(4); // Move buffer position

    // Longitude
    const lngArr = byteBuf.subarray(0, 5);
    const lngHexStr = Buffer.from(lngArr).toString("hex");
    const lngFloat =
      Number(lngHexStr.substring(3, 5) + "." + lngHexStr.substring(5, 9)) /
      Number("60");
    let lng = Number(lngHexStr.substring(0, 3)) + lngFloat;
    byteBuf = byteBuf.subarray(5); // Move buffer position

    // Bit indication
    const bitFlag = parseInt(lngHexStr.substring(9, 10), 16);

    // Positioning status
    const locationType = (bitFlag & 0x01) > 0 ? 1 : 0;

    // North latitude, south latitude
    if ((bitFlag & 0b0010) === 0) {
      lat = -lat;
    }

    // East longitude and West longitude
    if ((bitFlag & 0b0100) === 0) {
      lng = -lng;
    }

    // Speed
    const speed = byteBuf.readUInt8() * 1.85;
    byteBuf = byteBuf.subarray(1); // Move buffer position

    // Header (direction)
    const direction = byteBuf.readUInt8() * 2;
    byteBuf = byteBuf.subarray(1); // Move buffer position

    // Slave time
    const slaveMachineTimeArr = byteBuf.subarray(0, 6);
    const slaveMachineBcdTimeStr =
      Buffer.from(slaveMachineTimeArr).toString("hex");
    const slaveMachineZonedDateTime = ParserUtil.parseBcdTime(
      slaveMachineBcdTimeStr
    );
    byteBuf = byteBuf.subarray(6); // Move buffer position

    // Slave sensor ID
    const slaveMachineIdArr = byteBuf.subarray(0, 5);
    const slaveMachineId = Buffer.from(slaveMachineIdArr)
      .toString("hex")
      .toUpperCase();
    console.log(
      Buffer.from(slaveMachineIdArr).toString("hex").toUpperCase(),
      "=-=-=Buffer.from(slaveMachineIdArr).toString('hex').toUpperCase();=-=-="
    );
    byteBuf = byteBuf.subarray(5); // Move buffer position

    // Slave data serial number
    const flowId = byteBuf.readUInt8();
    byteBuf = byteBuf.subarray(1); // Move buffer position

    // Slave sensor battery level
    const voltage = Number(byteBuf.readUInt16BE()) / Number("100");
    byteBuf = byteBuf.subarray(2); // Move buffer position

    // Slave sensor battery percentage
    const power = byteBuf.readUInt8();
    byteBuf = byteBuf.subarray(1); // Move buffer position

    // RSSI
    const rssi = byteBuf.readUInt8();
    byteBuf = byteBuf.subarray(1); // Move buffer position

    // Sensor type
    const sensorType = byteBuf.readUInt8();
    byteBuf = byteBuf.subarray(1); // Move buffer position

    // Temperature value
    let temperature = -1000.0;

    // Humidity value
    let humidity = 0;

    // Event type
    let eventType = -1;

    // Device status
    let terminalStatus = -1;

    // Unlock & lock times
    let lockTimes = -1;

    if (sensorType === 1) {
      // Temperature
      temperature = ParserUtil.parseTemperature(byteBuf.readInt16BE());
      byteBuf = byteBuf.subarray(2); // Move buffer position

      // Humidity
      humidity = byteBuf.readUInt8();
      byteBuf = byteBuf.subarray(1); // Move buffer position

      // Gateway saves the number of data
      const itemCount = byteBuf.readUInt16BE();
      byteBuf = byteBuf.subarray(2); // Move buffer position

      // Gateway status
      const gatewayStatus = byteBuf.readUInt8();
      byteBuf = byteBuf.subarray(1); // Move buffer position
    } else if (sensorType === 4) {
      // Event
      const event = byteBuf.readUInt16BE();

      // Judgment event
      // Assuming EventTypeEnum is defined somewhere
      // Assuming NumberUtil.getBitValue is defined somewhere
      // Assuming parseEventType is defined somewhere
      eventType = ParserUtil.parseEventType(event);

      // Device status
      terminalStatus = byteBuf.readUInt16BE();
      byteBuf = byteBuf.subarray(2); // Move buffer position

      // Unlock times
      lockTimes = byteBuf.readUInt16BE();
      byteBuf = byteBuf.subarray(2); // Move buffer position

      // Gateway status
      const gatewayStatus = byteBuf.readUInt8();
      byteBuf = byteBuf.subarray(1); // Move buffer position
    } else if (sensorType === 5 || sensorType === 6) {
      // Event
      const event = byteBuf.readUInt16BE();

      // Judgment event
      // Assuming EventTypeEnum is defined somewhere
      // Assuming NumberUtil.getBitValue is defined somewhere
      // Assuming parseEventType is defined somewhere
      eventType = ParserUtil.parseEventType(event);

      // Device status
      terminalStatus = byteBuf.readUInt16BE();
      byteBuf = byteBuf.subarray(2); // Move buffer position

      // Unlock times
      lockTimes = byteBuf.readUInt16BE();
      byteBuf = byteBuf.subarray(2); // Move buffer position

      // Gateway status
      const gatewayStatus = byteBuf.readUInt8();
      byteBuf = byteBuf.subarray(1); // Move buffer position
    }

    sensorData.gpsTime = gpsZonedDateTime.toString();
    sensorData.latitude = lat;
    sensorData.longitude = lng;
    sensorData.locationType = locationType;
    sensorData.speed = speed;
    sensorData.direction = direction;
    sensorData.sensorID = slaveMachineId;
    sensorData.lockStatus = NumberUtil.getBitValue(terminalStatus, 0);
    sensorData.lockRope = NumberUtil.getBitValue(terminalStatus, 0);
    sensorData.lockTimes = lockTimes;
    sensorData.index = flowId;
    sensorData.voltage = voltage;
    sensorData.power = power;
    sensorData.RSSI = rssi;
    sensorData.dateTime = slaveMachineZonedDateTime.toString();
    sensorData.SensorType = sensorType;
    sensorData.Temperature = temperature;
    sensorData.Humidity = humidity;
    sensorData.event = eventType;
    return sensorData;
  }

  static parseEventType(event: number) {
    let eventType = 0;
    if (NumberUtil.getBitValue(event, 0) == 1) {
      eventType = EventTypeEnum.LockEvent_0;
    } else if (NumberUtil.getBitValue(event, 1) == 1) {
      eventType = EventTypeEnum.LockEvent_1;
    } else if (NumberUtil.getBitValue(event, 2) == 1) {
      eventType = EventTypeEnum.LockEvent_2;
    } else if (NumberUtil.getBitValue(event, 3) == 1) {
      eventType = EventTypeEnum.LockEvent_3;
    } else if (NumberUtil.getBitValue(event, 4) == 1) {
      eventType = EventTypeEnum.LockEvent_4;
    } else if (NumberUtil.getBitValue(event, 5) == 1) {
      eventType = EventTypeEnum.LockEvent_5;
    } else if (NumberUtil.getBitValue(event, 6) == 1) {
      eventType = EventTypeEnum.LockEvent_6;
    } else if (NumberUtil.getBitValue(event, 7) == 1) {
      eventType = EventTypeEnum.LockEvent_7;
    } else if (NumberUtil.getBitValue(event, 8) == 1) {
      eventType = EventTypeEnum.LockEvent_8;
    } else if (NumberUtil.getBitValue(event, 9) == 1) {
      eventType = EventTypeEnum.LockEvent_9;
    } else if (NumberUtil.getBitValue(event, 14) == 1) {
      eventType = EventTypeEnum.LockEvent_14;
    }
    return eventType;
  }

  /**
   * Parse P45
   * @param {string[]} itemList
   * @returns {LockEvent}
   */
  static parseP45(itemList: any[]) {
    const model: ISensorData = {
      dateTime: null,
      direction: 0,
      event: 0,
      index: 0,
      latitude: 0,
      locationType: 0,
      longitude: 0,
      mileage: 0,
      psdErrorTimes: 0,
      rfidNo: null,
      speed: 0,
      status: 0,
      unlockFenceID: null,
      gpsTime: "",
      sensorID: "",
      lockStatus: 0,
      lockRope: 0,
      lockTimes: 0,
      voltage: 0,
      power: null,
      RSSI: null,
      SensorType: 0,
      Temperature: 0,
      Humidity: null,
      vehicleID: 0,
      protocolType:0,
      deviceType:0,
      alarm:0,
      alarmArea:0,
      backCover:0,
      battery:0,
      cellID:0,
      dataLength:0,
      dataType:0,
      gpsSignal:0,
      gsmSignal:0,
      mcc:0,
      mnc:0,
      lac:0,
      imei:""
    };

    model.dateTime = ParserUtil.parseBcdTime(
      itemList[2] + itemList[3]
    ).toString();
    model.latitude = parseFloat(itemList[4]);
    if (itemList[5] === "S") {
      model.latitude = -model.latitude;
    }
    model.longitude = parseFloat(itemList[6]);
    if (itemList[7] === "W") {
      model.longitude = -model.longitude;
    }
    model.locationType = itemList[8] === "V" ? 0 : 1;
    model.speed = parseInt(itemList[9]);
    model.direction = parseInt(itemList[10]);
    model.event = parseInt(itemList[11]);

    // Unlock verification
    const status = parseInt(itemList[12]);
    model.rfidNo = itemList[13];

    // Dynamic password unlock
    if (model.event === 6) {
      if (status === 0) {
        // Incorrect unlock code
        model.status = 0;
      } else if (status > 0 && status <= 10) {
        // Normal unlock
        model.status = 1;
        // Fence ID when unlocking inside the fence
        model.unlockFenceID = status;
      } else if (status === 98) {
        // Normal unlock
        model.status = 1;
      } else if (status === 99) {
        // The device has enabled unlocking within the fence, and the current unlocking is not within the fence, refusing to unlock
        model.status = 3;
      }
    } else if (model.event === 4) {
      if (parseInt(itemList[14]) === 0) {
        // Incorrect unlock code
        model.status = 0;
      } else {
        // Normal unlock
        model.status = 1;
      }
    }

    model.psdErrorTimes = parseInt(itemList[15]);
    model.index = parseInt(itemList[16]);

    if (itemList.length > 17) {
      model.mileage = parseInt(itemList[17]);
    }

    return model;
  }

  static parseTemperature(temperatureInt: number) {
    if (temperatureInt === 0xffff) {
      return 9999.9;
    }
    let temperature = ((temperatureInt << 4) >> 4) * 0.1;
    if (temperatureInt >> 12 > 0) {
      temperature = -temperature;
    }
    return temperature;
  }

  static parseBcdTime(bcdTimeStr: any) {
    if (bcdTimeStr === "000000000000") {
      // The default time given is January 1, 2000 00:00:00
      bcdTimeStr = "010100000000";
    }
    console.log(bcdTimeStr, "=-=-=");
    const formatter = "YYMMDDHHmmss";
    const zonedDateTime = moment(bcdTimeStr,formatter).format("YYYY-MM-DD HH:mm:ss");
    console.log(zonedDateTime)
    return zonedDateTime;
  }

  static decodeBinaryMessage(inData: Buffer) {
    console.log(inData);
    // Protocol header
    inData.readUInt8(0);
    // Device ID
    let terminalNumArr = new Array(5);
    inData.readUInt8();
    let terminalNum = Buffer.from(terminalNumArr).toString("hex");
    console.log(terminalNum, "=-=-terminalNum=-=-=-");
    // Protocol version
    let version = inData.readUInt8(0);
    let tempByte = inData.readUInt8(0);
    // Device type
    let terminalType = tempByte >> 4;
    // Data type
    let dataType = tempByte & 0b00001111;
    // Data length
    let dataLen = inData.readUInt8(0);
    // GPS time
    let timeArr = new Array(6);
    inData.readUInt8(0);
    let bcdTimeStr = Buffer.from(timeArr).toString("hex");
    let gpsZonedDateTime = ParserUtil.parseBcdTime(bcdTimeStr);
    // Latitude
    let latArr = new Array(4);
    inData.readUInt8(0);
    let latHexStr = Buffer.from(latArr).toString("hex");
    let lat = 0.0;
    let latFloat =
      Number(latHexStr.substring(2, 4) + "." + latHexStr.substring(4)) /
      Number("60");
    lat = Number(latHexStr.substring(0, 2)) + latFloat;
    // Longitude
    let lngArr = new Array(5);
    inData.readUInt8(0);
    let lngHexStr = Buffer.from(lngArr).toString("hex");
    let lng = 0.0;
    let lngFloat =
      Number(lngHexStr.substring(3, 5) + "." + lngHexStr.substring(5, 9)) /
      Number("60");
    lng = Number(lngHexStr.substring(0, 3)) + lngFloat;
    // Bit indication
    let bitFlag = parseInt(lngHexStr.substring(9, 10), 16);
    // Positioning status
    let locationType = (bitFlag & 0x01) > 0 ? 1 : 0;
    // North latitude, south latitude
    if ((bitFlag & 0b0010) == 0) {
      lat = -lat;
    }
    // East longitude and West longitude
    if ((bitFlag & 0b0100) == 0) {
      lng = -lng;
    }
    // Speed
    let speed = Math.floor(inData.readUInt8(0) * 1.85);
    // Header (direction)
    let direction = inData.readUInt8(0) * 2;
    // Mileage
    let mileage = inData.readUInt8(0);
    // Number of GPS satellites
    let gpsSignal = inData.readUInt8(0);
    // Bind vehicle ID
    let vehicleId = inData.readUInt8(0);
    // Device status
    let terminalStatus = inData.readUInt8(0);
    // Whether the base station is located
    if (NumberUtil.getBitValue(terminalStatus, 0) == 1) {
      locationType = 2;
    }
    // Battery indicator
    let batteryPercent = inData.readUInt8(0);
    // 2G CELL ID
    let cellId2G = inData.readUInt8(0);
    // LAC
    let lac = inData.readUInt8(0);
    // GSM Signal quality
    let cellSignal = inData.readUInt8(0);
    // Fence Alarm ID
    let regionAlarmId = inData.readUInt8(0);
    // Device status3
    let terminalStatus3 = inData.readUInt8(0);
    // Wakeup source
    let fWakeSource = terminalStatus3 & 0b00001111;
    // Reserved
    inData.readUInt8(0);
    // IMEI No.
    let imeiArr = new Array(8);
    inData.readUInt8(0);
    let imei = Buffer.from(imeiArr).toString("hex");
    // 3G CELL ID High 16 bits
    let cellId3G = inData.readUInt8(0);
    let cellId = 0;
    if (cellId3G > 0) {
      cellId = (cellId3G << 16) + cellId2G;
    } else {
      cellId = cellId2G;
    }
    // MCC
    let mcc = inData.readUInt8(0);
    // MNC
    let mnc = inData.readUInt8(0);
    // Data serial number
    let flowId = inData.readUInt8(0);
    // Parse alarm
    let fAlarm = ParserUtil.parseLocationAlarm(terminalStatus);
    
    let location:ISensorData = {
      vehicleID : vehicleId,
      protocolType: version,
      deviceType: terminalType,
      dataType: dataType,
      dataLength: dataLen,
      gpsTime: gpsZonedDateTime.toString(),
      latitude: lat,
      longitude: lng,
      locationType: locationType,
      speed: speed,
      direction: direction,
      mileage: mileage,
      gpsSignal: gpsSignal,
      gsmSignal: cellSignal,
      alarmArea: regionAlarmId,
      battery: batteryPercent,
      lockStatus: NumberUtil.getBitValue(terminalStatus, 7) == 1 ? 0 : 1,
      lockRope: NumberUtil.getBitValue(terminalStatus, 6) == 1 ? 0 : 1,
      backCover: NumberUtil.getBitValue(terminalStatus, 13),
      mcc: mcc,
      mnc: mnc,
      lac: lac,
      cellID: cellId,
      imei: imei,
      alarm: fWakeSource,
      index: flowId,
      dateTime:null,
      event:0,
      Humidity:0,
      lockTimes:0,
      power:0,
      RSSI:0,
      sensorID:"",
      SensorType:0,
      Temperature:0,
      voltage:0,
      psdErrorTimes:0,
      rfidNo:"",
      status:0,
      unlockFenceID:0
    };

    let model:IJT701Data = {
      DeviceID: terminalNum,
      MsgType: "Location",
      DataBody: location,
      ReplyMsg: version < 0x19 ? "(P35)" : `(P69,0,${flowId})`,
    };

    return model;
  }

  static parseLocationAlarm(terminalStatus: number) {
    // Trigger alarm or not
    let fAlarm = -1;
    // Acknowledge or not
    if (NumberUtil.getBitValue(terminalStatus, 5) == 1) {
      // Judgment alarm
      if (NumberUtil.getBitValue(terminalStatus, 1) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_9;
      } else if (NumberUtil.getBitValue(terminalStatus, 2) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_10;
      } else if (NumberUtil.getBitValue(terminalStatus, 3) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_1;
      } else if (NumberUtil.getBitValue(terminalStatus, 4) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_2;
      } else if (NumberUtil.getBitValue(terminalStatus, 8) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_3;
      } else if (NumberUtil.getBitValue(terminalStatus, 9) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_4;
      } else if (NumberUtil.getBitValue(terminalStatus, 10) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_5;
      } else if (NumberUtil.getBitValue(terminalStatus, 11) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_6;
      } else if (NumberUtil.getBitValue(terminalStatus, 12) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_7;
      } else if (NumberUtil.getBitValue(terminalStatus, 14) == 1) {
        fAlarm = AlarmTypeEnum.LOCK_ALARM_8;
      } else {
        fAlarm = -1;
      }
    }
    return fAlarm;
  }

  static replyMessage(msgType: string, itemList: any[]) {
    let replyContent = null;
    switch (msgType) {
      case "P22":
        let currentDateTime = moment().format("ddMMyyHHmmss");
        replyContent = `(P22,${currentDateTime})`;
        3;
        break;
      case "P43":
        if (itemList[2] === "0") {
          //reset Password
          replyContent = `(P44,1,888888)`;
        }
        break;
      case "P45":
        replyContent = `(P69,0,${itemList[16]})`;
        break;
      case "P52":
        if (itemList[2] === "2") {
          replyContent = `(P52,2,${itemList[3]})`;
        }
        break;
      default:
        break;
    }
    return replyContent;
  }

  static replyMessageWLNET(msgType: string, index: any) {
    let replyContent = null;
    switch (msgType) {
      case "WLNET5":
      case "WLNET7":
        replyContent = `(P69,0,${index})`;
        break;
      default:
        break;
    }
    return replyContent;
  }
}
