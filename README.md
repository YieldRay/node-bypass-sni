# Node-Bypass-SNI

Some nodejs scripts for accessing websites blocked by SNI

This only works for website that do not check SNI servername,  
otherwise it fails to make SSL handshake and error like  
`sslv3 alert handshake` `SSL alert number 40` will be thrown

## Generate Self-Signed Certificate

```sh
# make certificate woring directory
mkdir cert
cp v3.ext cert/
cd cert

# generate CA
openssl genrsa -out CA.key
openssl req -new -x509 -days 3650 -key CA.key -out CA.crt -subj "/C=CN/ST=nope/L=nope/O=nope/OU=nope/CN=YieldRay/emailAddress=yieldray@outlook.com"

# generate website certificate (pixiv.net for illustrating)
# !!! edit `cert/v3.ext` to add domains !!!
openssl genrsa -out pixiv.key
openssl req -new -key pixiv.key -out pixiv.csr -subj "/C=CN/ST=nope/L=nope/O=nope/OU=nope/CN=*.pixiv.net/emailAddress=yieldray@outlook.com"
openssl x509 -req -CA CA.crt -CAkey CA.key -CAcreateserial -days 3560 -in pixiv.csr -out pixiv.crt -extfile v3.ext

# generate PEM certificate
openssl x509 -in pixiv.crt -out pixiv.pem -outform PEM
```

For windows, install `CA.crt`  
Manage Certificate by `certmgr.msc`

## Edit HOSTS

Edit `HOSTS` file to make proxied domain resolve to local server `127.0.0.1`

```hosts
# This is just an example

127.0.0.1 pximg.net
127.0.0.1 www.pixiv.net
127.0.0.1 i.pximg.net
127.0.0.1 s.pximg.net
127.0.0.1 img-sketch.pximg.net
127.0.0.1 accounts.pixiv.net
127.0.0.1 imgaz.pixiv.net
127.0.0.1 app-api.pixiv.net
127.0.0.1 oauth.secure.pixiv.net
```

> **Notice**:  
> In the example, we bypass www.pixiv.net  
> As pixiv use Recaptcha, you should also bypass it for login

## Create Server

```js
const fs = require("node:fs");
const createProxySocketServer = require("./src/create_proxy_socket");

const server = createProxySocketServer(
    {
        //! use website certificate
        key: fs.readFileSync("./cert/pixiv.key"),
        cert: fs.readFileSync("./cert/pixiv.pem"),
    },
    {
        //! use a domain to ip table rather than resolve it from DNS server
        domain2ip: {
            "www.pixiv.net": "210.140.92.193",
            "s.pximg.net": "210.140.92.144",
            "accounts.pixiv.net": "172.64.151.90",
            "i.pximg.net": "210.140.92.141",
        },
        //! fallback DNS server
        dnsServer: ["223.5.5.5", "223.6.6.6"],
        //! fake servername to bypass SNI
        fakeServername: "github.com",
    }
);

//! make sure node.js is allowed to bind you 443 port
server.listen(443, () => {
    console.log("Socket bound.\nTest: https://www.pixiv.net");
});
```
