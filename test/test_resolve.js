const { dohResolve } = require("../src/resolve_ip_doh");
const child_process = require("node:child_process");
const createResolve = require("../src/resolve_ip");
const resolve = createResolve({}, ["185.222.222.222", "45.11.45.11"]);

function baiduIP(ip) {
    return fetch(`http://opendata.baidu.com/api.php?query=${ip}&co=&resource_id=6006&oe=utf8`)
        .then((res) => res.json())
        .then((o) => o.data[0].location);
}
function infoIP(ip) {
    return fetch(`https://ip.useragentinfo.com/json?ip=${ip}`).then((res) => res.text());
}

function ping(ip) {
    child_process.execSync(`ping ${ip}`, {
        stdio: ["inherit", "inherit", "inherit"],
    });
}

async function main(hostname) {
    const ips = await dohResolve(hostname);
    console.log(await Promise.all(ips.map(infoIP)));
    ping(ips[0]);
}

main("pixiv.net");
// process.addListener("uncaughtException", () => {});
