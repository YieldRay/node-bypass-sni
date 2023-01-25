const tls = require("node:tls");

/**
 * @param options
 * {{
 *     host: string;
 *     port?: number;
 *     servername?: string;
 *     fakeServername?: string;
 * }}
 * @param tlsOptions {tls.ConnectionOptions}
 */
function createBypassSNISocket(options, tlsOptions = {}) {
    if (!options.host) throw new Error(`"host" cannot be undefined`);
    const host = options.host;
    const port = options.port || 443;
    const servername = options.servername || host;
    const fakeServername = options.fakeServername || "github.com";

    const socket = tls.connect(
        {
            host,
            port,
            servername: fakeServername,
            rejectUnauthorized: false,
            checkServerIdentity: () => {
                return null;
            },
            ...tlsOptions,
        },
        () => {
            socket.servername = servername;
        }
    );
    // socket.setDefaultEncoding("utf-8");
    // const logFilePath = "./log/ssl-keys.log";
    // const logFile = fs.createWriteStream(logFilePath, { flags: "a" });
    // socket.on("keylog", (line) => logFile.write(line));
    return socket;
}

module.exports = createBypassSNISocket;
