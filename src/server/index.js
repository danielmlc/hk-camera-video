var express =  require("express");
const path = require('path')
const koaStatic = require('koa-static')
const { server } = require('./yaml-provider')
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
function serverStart() {
  
  let app = express();
  app.get('/', (req, res) => {
    res.send("It's ok!!!");
  })
  app.get('/live/get',handleGetRequest);
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  })
  app.use(express.static(path.join(process.cwd(), '/dist/contents/')));
  app.listen(server.port, server.host);
  console.log("express listened at: " + server.ip+':' + server.port )
}

function handleGetRequest (req, res) {
  const params = req.query
  var url = `rtsp://${params.user}:${params.pwd}@${params.ip}/Streaming/Channels/102?transportmode=unicast`
  try {
    let common = ffmpeg(url)
        .setFfmpegPath(ffmpegPath)
        .addInputOption("-rtsp_transport", "tcp", "-buffer_size", "102400", "-loglevel", "quiet")  // 这里可以添加一些 RTSP 优化的参数
        .on("start", function () {
            console.log(url, "Stream started.");
        })
        .on("codecData", function () {
            console.log(url, "Stream codecData.")
         // 摄像机在线处理
        })
        .on("error", function (err) {
            console.log(url, "An error occured: ", err);
        })
        .on("end", function () {
            console.log(url, "Stream end!");
         // 摄像机断线的处理
        })
        let videoStream = common.outputFormat("flv").videoCodec("copy").noAudio();
        videoStream.pipe(res)
  } catch (error) {
      console.log(error);
  }
}

serverStart();

