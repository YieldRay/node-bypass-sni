/**
 *
 * This script need global fetch
 * Node.js >= 18 is required!!!
 *
 * https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
 */

// https://cloudflare-dns.com/dns-query
// https://dns.google/resolve
async function doh(server, name, type = "A") {
    const url = new URL(server);
    url.searchParams.set("name", name);
    url.searchParams.set("type", type);
    const res = await fetch(url, {
        headers: {
            "content-type": "application/dns-message",
            accept: "application/dns-json",
        },
    });
    if (!res.ok) throw new Error(`fetch is not OK. make sure you are using a DoH server with json support`);
    const txt = await res.text();
    try {
        return JSON.parse(txt);
    } catch {
        throw new Error(`make sure you are using a DoH server with json support`);
    }
}

async function dohResolve(name, server = "https://cors.488848.xyz/https://cloudflare-dns.com/dns-query") {
    const resp = await doh(server, name);
    // https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6
    if (resp.Status !== 0) throw new Error(`Error code ${resp.Status}`);
    return resp.Answer.filter((a) => a.type === 1).map((a) => a.data);
}

module.exports = { doh, dohResolve };
