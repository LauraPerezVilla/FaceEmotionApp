const ctx = document.getElementById("myChart");
let video = document.getElementById("videoInput");

// Checkeamos si el navegador soporta mediaDevices
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Pedimos acceso a la cámara del usuario
    navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        // Set the video source to the camera stream
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error("Error accediendo a la cámara: ", error);
    });
} else {
    console.log("getUserMedia no es soportado por el navegador.");
}


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
  "ws://127.0.0.1:8010/ws/graph/"
);
// Configurar WebSocket para manejar binarios
socket.binaryType = "arraybuffer";

socket.onopen = function (e) {
    processVideo()
}

socket.onmessage = function (e) {
    var djangoData = JSON.parse(e.data);
    console.log(djangoData);

    // Actualizar el gráfico
    var newGraphData = graphData.data.datasets[0].data;
    newGraphData = djangoData.preds[0];

    graphData.data.datasets[0].data = newGraphData;
    myChart.update();
};

socket.onclose = function() {
    console.log("WebSocket connection closed");
}

function processVideo() {
    let cap = new cv.VideoCapture(video);
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

    function sendFrame() {
        if (socket.readyState !== WebSocket.OPEN) return;

         // Capturar el frame
        cap.read(frame);

        // Reducir la resolución del frame para enviar menos datos
        let reducedFrame = new cv.Mat();
        cv.resize(frame, reducedFrame, new cv.Size(320, 240)); 

        let data = reducedFrame.data; // `Uint8Array` en formato [R, G, B, A, R, G, B, A ...]

        // Convertir RGBA (4 canales) a RGB (3 canales)
        let rgbArray = new Uint8Array(320 * 240 * 3);
        let index = 0;
        for (let i = 0; i < data.length; i += 4) {
            rgbArray[index] = data[i];     // R
            rgbArray[index + 1] = data[i + 1]; // G
            rgbArray[index + 2] = data[i + 2]; // B
            index += 3;
        }

        socket.send(rgbArray.buffer); // Enviar datos como binario

        setTimeout(sendFrame, 1000); // Enviamos el frame al servidor cada 1s 
    }

    sendFrame();
}

