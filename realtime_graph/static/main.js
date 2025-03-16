const ctx = document.getElementById("myChart");
// let video = document.getElementById("videoInput");
// let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
// let cap = new cv.VideoCapture(video);
// Check if the browser supports the MediaDevices API
// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     // Request access to the user's camera
//     navigator.mediaDevices.getUserMedia({ video: true })
//     .then((stream) => {
//         // Set the video source to the camera stream
//         video.srcObject = stream;
//     })
//     .catch((error) => {
//         console.error("Error accessing the camera: ", error);
//     });
// } else {
//     console.log("getUserMedia is not supported in this browser.");
// }


var graphData = {
  type: "bar",
  data: {
    labels: ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"],
    datasets: [
      {
        label: "Emotion predict",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};
var myChart = new Chart(ctx, graphData);
var socket = new WebSocket(
  "ws://127.0.0.1:8001/ws/graph/?video_url=http://192.168.1.1:8080/video"
);

socket.onmessage = function (e) {
  var djangoData = JSON.parse(e.data);
  console.log(djangoData.preds[0]);

  var newGraphData = graphData.data.datasets[0].data;
  newGraphData = djangoData.preds[0];

  graphData.data.datasets[0].data = newGraphData;
  myChart.update();
};
let FPS = 30

// socket.onopen = function (e) {
//     setTimeout(processVideo, 0);
// }

// function processVideo () {
//     let begin = Date.now();
//     cap.read(src);
//     socket.send(src.data)
//     setTimeout(processVideo, 1000);
// }