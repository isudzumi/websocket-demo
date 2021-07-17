import WebSocket from "ws";
import http2 from "http2";
import { promises as fsp } from "fs";
const { PRIVATE_KEY_PATH, CERT_FILE_PATH } = process.env;

const PORT = 3000;

const wsChat = new WebSocket.Server({ noServer: true });
const wsCounter = new WebSocket.Server({ noServer: true });

// wsChat.on("connection", (ws) => {
//   ws.on("message", (data) => {
//     wsChat.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(data);
//       }
//     });
//   });
// });
//
// wsCounter.on("connection", (ws) => {
//   wsCounter.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(wsCounter.clients.size);
//     }
//   });
// });

const server = http2.createSecureServer({
  key: await fsp.readFile(PRIVATE_KEY_PATH),
  cert: await fsp.readFile(CERT_FILE_PATH, 'utf8'),
  settings: {
    enableConnectProtocol: true,
  },
});

server.on("stream", async (stream, headers) => {
  if (headers[":method"] === "CONNECT") {
    stream.respond({
      ":status": 200,
    });
    return;
  }
  stream.respond({
    "content-type": "text/html; charset=utf-8",
    ":status": 200,
  });
  const body = await fsp.readFile("./index.html", "utf8");
  stream.end(body);
});

// server.on("upgrade", (req, socket, head) => {
//   if (req.url === "/ws") {
//     wsChat.handleUpgrade(req, socket, head, (ws) => {
//       wsChat.emit("connection", ws, req);
//     });
//   } else if (req.url === "/connection") {
//     wsCounter.handleUpgrade(req, socket, head, (ws) => {
//       wsCounter.emit("connection", ws, req);
//     });
//   }
// });

server.on("error", (e) => {
  console.error(e);
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
