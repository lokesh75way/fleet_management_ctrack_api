import net from 'net';
import fs from 'fs';
import util from 'util';
import DeviceLogs from '../../schema/DeviceLogs';
import {JT701} from "./Conversion";

const PORT = 80;
const HOST = '157.175.107.239';
const filePath = `./${HOST}`;

const accessPromise = util.promisify(fs.access);
const unlinkPromise = util.promisify(fs.unlink);

/**
 * Connet IP and Port using net module
 * Found data via socket
 */
export const initJT701Server = async () => {
  /**
   * Check and remove connnection file if exist
   */
  await (async () => {
    try {
      await accessPromise(filePath, fs.constants.F_OK);
      // File exists, so delete it
      await unlinkPromise(filePath);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        console.error('File does not exist');
      } else {
        console.error('Error:', err);
      }
    }
  })();
// let data = "28373030303331333330392C312C3038312C574C4E45542C352C322C05082115430722348250113550300F0000050821154304E0171E086925018D4E690400400000002A0029";
// await JT701.receiveData(data);
  const server = net.createServer((socket: any) => {
    console.log('Client connected');
  
    socket.on('data', async (data: string) => {
      console.log('Received:', data.toString());
      await DeviceLogs.create({
        others: data,
        packets: data
      })
      await JT701.receiveData(data);
    });
  
    socket.on('end', () => {
      console.log('Client disconnected');
    });
  });
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  server.on("connect",()=>{
    console.log('Connected to server');
  });

  server.listen(HOST, PORT, () => {
    console.log(`JT701 server listening on ${HOST}:${PORT}`);
  });
}