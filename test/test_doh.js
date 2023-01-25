const { doh, dohResolve } = require("../src/resolve_ip_doh");

const GOOGLE = "https://cors.488848.xyz/https://dns.google/resolve";
const CF = "https://cors.488848.xyz/https://cloudflare-dns.com/dns-query";

// doh(GOOGLE, "www.pixiv.net").then(console.log);
// doh(CF, "www.pixiv.net").then(console.log);
dohResolve("i.pximg.net", GOOGLE).then(console.log);
// dohResolve("pixiv.net", CF).then(console.log);
