const httpRequest = require("../src/http_bypass_sni");
const { writeFileSync } = require("node:fs");
const { dohResolve } = require("../src/resolve_ip_doh");
const { basename } = require("node:path");

async function req(url, timeout = 2000) {
    const u = new URL(url);
    const hosts = await dohResolve(u.host);
    for (const host of hosts) {
        try {
            const res = await httpRequest({
                host,
                path: u.pathname,
                servername: u.host,
                headers: {
                    Referer: "https://www.pixiv.net/",
                    "User-Agent": "PixivIOSApp/6.7.1 (iOS 10.3.1; iPhone8,1)",
                },
                signal: AbortSignal.timeout(timeout),
            });

            return { ...res, name: basename(u.pathname), host };
        } catch (e) {
            console.error(host, e);
        }
    }
    throw new Error(`No available IP ${hosts}`);
}

module.exports = req;

req("https://i.pximg.net/img-original/img/2023/01/25/00/03/22/104786411_p0.jpg")
    .then((res) => {
        console.log(`Downloaded to ${res.name}`);
        writeFileSync(res.name, res.body);
    })
    .catch((e) => console.error(e.message));
