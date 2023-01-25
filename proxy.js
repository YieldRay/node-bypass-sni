const fs = require("node:fs");

const createProxySocketServer = require("./src/create_proxy_socket");

const server = createProxySocketServer(
    {
        key: fs.readFileSync("./cert/pixiv.key"),
        cert: fs.readFileSync("./cert/pixiv.pem"),
    },
    {
        domain2ip: {
            "www.pixiv.net": "210.140.92.193",
            "s.pximg.net": "210.140.92.144",
            "accounts.pixiv.net": "172.64.151.90",
            "i.pximg.net": "210.140.92.141",
        },
        dnsServer: ["223.5.5.5", "223.6.6.6"],
        fakeServername: "github.com",
    }
);

server.listen(443, () => {
    console.log("Socket bound.\nTest: https://www.pixiv.net");
});
