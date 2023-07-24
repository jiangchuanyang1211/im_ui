const express = require("express");
const app = express();
// const data = require("./mock/device/device.js");
const data = require("./mock/device/activate.js");
const router = express.Router();

app.get('/', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    // 所以可以单独配置白名单,也就是能进行跨域访问的网址
    // res.setHeader("Access-Control-Allow-Origin",["http://127.0.0.1:5500"]);

    //...Headers必须的固定值,"content-type"
    res.setHeader("Access-Control-Allow-Headers","X-request-With,content-type");
    // res.setHeader("Access-Control-Allow-Headers","X-request-With");

    res.setHeader("Access-Control-Allow-Methods","GET,POST,DELETE,PUT,OPTIONS")
    res.send({
        name: 'taocong',
        age: 18
    })
})

app.use("/api1", router)
router.use("/test", data);

app.listen(8082, () => {
    console.log("http://127.0.0.1:8082")
})