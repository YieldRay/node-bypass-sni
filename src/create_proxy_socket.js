const tls = require("node:tls");

const createBypassSNISocket = require("./socket_bypass_sni");
const createResolve = require("./resolve_ip");

/**
 *
 * @param {tls.TlsOptions} tlsOptions
 * @param {{domain2ip,dnsServer,fakeServername}} options
 * @param {tls.ConnectionOptions} clientTlsOptions This is only need if the target server requires client certificate authentication (if throw `SSL alert number 42`)
 * @returns
 */
function createProxySocketServer(tlsOptions = {}, options = {}, clientTlsOptions = {}) {
    const domain2ip = options.domain2ip || {};
    const dnsServer = options.dnsServer;
    const fakeServername = options.fakeServername;

    // ip resolve function
    const resolve4 = createResolve(domain2ip, dnsServer);

    // create socket server
    const server = tls.createServer(
        {
            ...tlsOptions,
            requestCert: false,
        },
        async (socket) => {
            const domain = socket.servername;
            const ip = await resolve4(socket.servername);
            console.log(`[${new Date().toLocaleString()}]  ${domain} ${ip}`);

            const targetSocket = createBypassSNISocket(
                {
                    host: ip,
                    servername: domain,
                    fakeServername,
                },
                clientTlsOptions // this is client tls options for connecting to target site
            );
            targetSocket.on("error", (err) => {
                console.warn(err.message); // log a warning
                socket.end();
            });
            socket.pipe(targetSocket);
            targetSocket.pipe(socket);
        }
    );

    return server;
}

module.exports = createProxySocketServer;
