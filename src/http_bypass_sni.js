const { METHODS } = require("node:http");
const createBypassSNISocket = require("./socket_bypass_sni");

/**
 * @param options
 * {{
 *     host: string;
 *     servername?: string;
 *     port?: number;
 *     path: string;
 *     method?: string;
 *     body?: Buffer;
 *     headers?: { [key: string]: string };
 * }}
 * @returns {Promise<{statusCode:string; statusText:string; headers:{[key: string]:string}; body:Buffer;}>}
 */
function httpRequest(options, tlsOptions) {
    const host = options.host;
    const port = options.port;
    const servername = options.servername || host;
    const path = options.path || "/";
    const method = (options.method || "GET").toUpperCase();
    const headers = options.headers || {};
    const body = options.body || "";
    const bodyData = body instanceof Buffer ? body : Buffer.from(body);
    if (!METHODS.includes(method)) console.warn(`unknown method: ${method}`);

    const socket = createBypassSNISocket({ host, port, servername }, tlsOptions);
    socket.setKeepAlive(false);

    return new Promise((resolve, reject) => {
        socket.write(
            Buffer.concat([
                Buffer.from(
                    `${method} ${path} HTTP/1.0` +
                        "\r\n" +
                        Object.entries({
                            Accept: "*/*",
                            ...formatHeaders(headers),
                            Host: servername,
                            Connection: "close",
                            "Accept-Encoding": "identity",
                            "Content-Length": bodyData.length,
                        }).reduce((acc, cur) => (acc += `${cur[0]}: ${cur[1]}\r\n`), "") +
                        "\r\n"
                ),
                bodyData,
            ])
        );
        const chunks = [];
        socket.on("data", (data) => chunks.push(data));
        socket.on("error", reject);
        socket.on("end", () => {
            const [info, body] = fixChunks(chunks);
            resolve({ ...info, body });
        });
    });
}

function formatHeaders(obj) {
    let o = {};
    for (let [k, v] of Object.entries(obj)) {
        k = k
            .split("-")
            .map((str) => str[0].toUpperCase() + str.slice(1))
            .join("-");
        o[k] = v;
    }
    return o;
}

function parseHeaders(rows) {
    const headers = {};
    rows = rows.split("\r\n");
    const [httpVersion, statusCode, ...statusTexts] = rows[0].split(" ");
    rows.slice(1).forEach((row) => {
        const [k, ...vs] = row.split(":");
        const v = vs.join(":");
        Reflect.set(headers, k.trim(), v.trim());
    });
    return { headers, httpVersion, statusCode, statusText: statusTexts.join(" ") };
}

function fixChunks(chunks) {
    if (chunks.length === 0) throw new Error("no chunk is read");
    const withHeader = chunks[0];
    const p = find_0d_0a_0d_0a(withHeader);
    const header = withHeader.subarray(0, p);
    const info = parseHeaders(header.toString("utf8"));
    chunks[0] = withHeader.subarray(p + 4);

    const body = Buffer.concat(chunks);
    return [info, body];
}

function find_0d_0a_0d_0a(buf) {
    let i = 0;
    while (i < buf.length) {
        if (buf.subarray(i, i + 4).equals(Buffer.from("\r\n\r\n"))) {
            return i;
        }
        i++;
    }
    return -1;
}

module.exports = httpRequest;
