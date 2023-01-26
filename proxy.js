const fs = require("node:fs");
const createProxySocketServer = require("./src/create_proxy_socket");

const server = createProxySocketServer(
    {
        key: fs.readFileSync("./cert/pixiv.key"),
        cert: fs.readFileSync("./cert/pixiv.pem"),
    },
    {
        domain2ip: {
            "www.pixiv.net": ["172.64.151.90", "210.140.92.183", "210.140.92.187", "210.140.92.193"],
            // "i.pximg.net": "210.140.92.145", // 210.140.92.14[1-9]
        },
        dnsServer: "https://cors.488848.xyz/https://dns.google/resolve",
        fakeServername: "github.com",
    }
);

server.listen(443, () => {
    console.log("Socket bound.\nTest: https://www.pixiv.net");
});
