import WebSocket from "ws";
import http from "http";
import { promises as fsp } from "fs";

const PORT = 3000;

const wsChat = new WebSocket.Server({ noServer: true });
const wsCounter = new WebSocket.Server({ noServer: true });

wsChat.on("connection", (ws) => {
  ws.on("message", (data) => {
    wsChat.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

wsCounter.on("connection", (ws) => {
  wsCounter.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(wsCounter.clients.size);
    }
  });
});

const server = http.createServer(async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  const html = await fsp.readFile("./index.html", { encoding: "utf8" });
  res.end(html, "utf-8");
});

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wsChat.handleUpgrade(req, socket, head, (ws) => {
      wsChat.emit("connection", ws, req);
    });
  } else if (req.url === "/connection") {
    wsCounter.handleUpgrade(req, socket, head, (ws) => {
      wsCounter.emit("connection", ws, req);
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
