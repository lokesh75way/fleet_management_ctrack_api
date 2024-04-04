import TrakingHistory, { GpsDeviceType } from "../../schema/TrakingHistory";

const { ProtocolParser, parseIMEI, Data, GPRS } = require('complete-teltonika-parser');

const packet = '00000000000000A7080400000113FC208DFF000F14F650209CCA80006F00D60400040004030101150316030001460000015D0000000113FC17610B000F14FFE0209CC580006E00C00500010004030101150316010001460000015E0000000113FC284945000F150F00209CD200009501080400000004030101150016030001460000015D0000000113FC267C5B000F150A50209CCCC0009300680400000004030101150016030001460000015B00040000BA48'
const packet2 = "000F333532303933303839313638383231";

/**
 * Parse IMEI packets into string
 * @param { packet } 
 * @returns { imei }
 */
const parseImeiFunction = (packet: any) => {
  packet = packet.toString('hex');
  let imeiNumber = packet.slice(4);
  imeiNumber = (Buffer.from(imeiNumber, 'hex'));
  return imeiNumber.toString();
}

/**
 * Teltonika parser: Convert packets into JSON 
 * @param { packet } 
 * @returns { Object }
 */
const teltonikaPacketConversion = async (packet: string) => {
    if (packet.length == 34) {
        return {
            data: await parseIMEI(packet),
            type: "imei"
        }
    } else {
        const convertedData = await new ProtocolParser(packet);
        return { 
            data: convertedData.Content.AVL_Datas,
            type: "message"
        }
    }
}

const imeiNo: number = parseImeiFunction(packet2);

/**
 * Covert Teltonika packet response to JSON
 * Call function to save data in our database.
 * @param { packet } 
 * @returns { Array of Object }
 */
export const handleTeltonikaPackets = async (packet: string) => {
    const { data, type } = await teltonikaPacketConversion(packet);
    if(type == "imei") return data;
    if(type == "message"){
        const payload = data.map((element: any) => ({
            deviceType: GpsDeviceType.TELTONIKA,
            imeiNumber: imeiNo,
            dateTime: element?.Timestamp,
            lattitude: element?.GPSelement?.Longitude,
            longitude: element?.GPSelement?.Latitude,
            priority: element?.Priority,
            altitude: element?.GPSelement?.Altitude,
            angle: element?.GPSelement?.Angle,
            satellites: element?.GPSelement?.Satellites,
            speed: element?.GPSelement?.Speed,
            ioElement: {
              eventID: element?.IOelement?.EventID,
              elementCount: element?.IOelement?.ElementCount,
              elements: element?.IOelement?.Elements,
            }
        }));
        await saveTrakingHistory(payload);
    }
}

/**
 * Function to save traking - history in database.
 * @param { payload } 
 */
const saveTrakingHistory = async(payload: object) => {
  try {
    const result = await TrakingHistory.insertMany(payload);
    if(result){
      console.log('Data saved success!')
    }
  } catch (error) {
    console.log('error', error)
  }
}