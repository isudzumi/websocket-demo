import http2 from 'http2';
import { promises as fsp } from 'fs';
import { WebSocket } from './web-socket.js';
const { PRIVATE_KEY_PATH, CERT_FILE_PATH } = process.env;

const PORT = 3000;

const createTestData = () => {
	const buf = new Uint8Array(6);
	buf[0] = 0x81;
	buf[1] = 0x4;
	buf[2] = 'test'.charCodeAt(0);
	buf[3] = 'test'.charCodeAt(1);
	buf[4] = 'test'.charCodeAt(2);
	buf[5] = 'test'.charCodeAt(3);
	return buf;
};

const server = http2.createSecureServer({
	key: await fsp.readFile(PRIVATE_KEY_PATH),
	cert: await fsp.readFile(CERT_FILE_PATH, 'utf-8'),
	settings: {
		enableConnectProtocol: true,
	},
});

server.on('stream', async (stream, headers) => {
	if (
		headers[':method'] === 'CONNECT' &&
		headers[':protocol'] === 'websocket'
	) {
		if (headers[':path'] === '/connection' || headers[':path'] === '/ws') {
			stream.respond({
				':status': 200,
			});

			stream.on('data', (chunk) => {
				const wb = new WebSocket(new Uint8Array(chunk));
				console.log(new TextDecoder().decode(wb.payload));
				stream.end(createTestData());
			});
			return;
		}
	}
	stream.respond({
		'content-type': 'text/html; charset=utf-8',
		':status': 200,
	});
	const body = await fsp.readFile('./index.html', 'utf8');
	stream.end(body);
});

server.on('error', (e) => {
	console.error(e);
});

server.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`);
});
