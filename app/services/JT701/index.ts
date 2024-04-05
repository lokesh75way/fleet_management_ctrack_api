import net from 'net';
import fs from 'fs';
import util from 'util';
import DeviceLogs from '../../schema/DeviceLogs';
import {JT701} from "./Conversion";

const PORT = 21696;
const HOST = 'ch1199431.flespi.gw';
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

  const server = net.createServer((socket: any) => {
    console.log('Client connected');
  
    socket.on('data', async (data: string) => {
      console.log('Received:', data.toString());
      await DeviceLogs.create({
        others: data,
        packets: data
      })
      JT701.receiveData(data);
    });
  
    socket.on('end', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(HOST, PORT, () => {
    console.log(`JT701 server listening on ${HOST}:${PORT}`);
  });
}