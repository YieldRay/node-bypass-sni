const httpRequest = require("../src/http_bypass_sni");

// httpRequest({
//     host: "210.140.92.193", // set IP to connect specified IP adress
//     servername: "www.pixiv.net",
//     path: "/",
//     // method: "POST",
//     // body: new URLSearchParams({ abc: "xyz", key: "val" }).toString(),
//     // headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
// }).then((res) => {
//     require("fs").writeFileSync("test.html", res.body);
//     delete res.body;
//     console.log(res);
// });

httpRequest({
    host: "in.appcenter.ms",
    path: "/",
}).then((res) => {
    require("fs").writeFileSync("test.html", res.body);
    delete res.body;
    console.log(res);
});
