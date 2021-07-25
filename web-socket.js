export class WebSocket {
	constructor(buf) {
		this.buf = buf;
	}

	get opcodeType() {
		const opcode = this.buf[0] & 0x0f;
		switch (opcode) {
			case 0x0:
				return 'continuation';
			case 0x1:
				return 'text';
			case 0x2:
				return 'binary';
			case 0x8:
				return 'connection close';
			case 0x9:
				return 'ping';
			case 0xa:
				return 'pong';
			default:
				return 'reserved';
		}
	}

	get isMasked() {
		const mask = (this.buf[1] & 0x80) >>> 7;
		return Boolean(mask);
	}

	get maskingKey() {
		return this.buf.slice(2, 6);
	}

	get payloadLength() {
		return this.buf[1] & 0x7f;
	}

	get payload() {
		if (this.opcodeType !== 'text') {
			return;
		}
		if (this.isMasked) {
			return this.buf
				.slice(6, 6 + this.payloadLength)
				.map((v, i) => v ^ this.maskingKey[i % 4]);
		}
		return;
	}
}
