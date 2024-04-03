import net from 'net';

const PORT = 21696;
const HOST = 'ch1199431.flespi.gw';

const server = net.createServer((socket: any) => {
    console.log('Client connected');
  
    socket.on('data', (data: string) => {
      console.log('Received:', data.toString());
    });
  
    socket.on('end', () => {
      console.log('Client disconnected');
    });
});
  
// server.listen(HOST, PORT, () => {
//     console.log(`Teltonika server listening on ${HOST}:${PORT}`);
// });