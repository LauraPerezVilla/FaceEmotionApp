const ctx = document.getElementById("myChart");
let video = document.getElementById("videoInput");

// Spanish translations for emotions
const emotionTranslations = {
    'angry': 'Enojo',
    'disgust': 'Disgusto',
    'fear': 'Miedo',
    'happy': 'Felicidad',
    'neutral': 'Neutral',
    'sad': 'Tristeza',
    'surprise': 'Sorpresa'
};

const token = ""

// --- Jitsi Meet lib-jitsi-meet.js integration ---
const domain = "meet.jit.si";
const options = {
    hosts: {
        domain: domain,
        muc: "conference." + domain
    },
    serviceUrl: `wss://${domain}/xmpp-websocket`,
    clientNode: "http://jitsi.org/jitsimeet"
};
const confOptions = { openBridgeChannel: true };
const roomName = session_id;

JitsiMeetJS.init();

const connection = new JitsiMeetJS.JitsiConnection(null, token, options);

connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
);
connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    (error) => {
        console.error("Jitsi Connection Failed", error);
    }
);
connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    () => console.log("Jitsi Connection Disconnected")
);

connection.connect();

let conference = null;
let remoteVideoAttached = false;

function onConnectionSuccess() {
    conference = connection.initJitsiConference(roomName, confOptions);
    conference.on(
        JitsiMeetJS.events.conference.TRACK_ADDED,
        onRemoteTrack
    );
    conference.join();
}

function onRemoteTrack(track) {
    if (track.getType() === "video" && !track.isLocal() && !remoteVideoAttached) {
        // Attach to a video element
        const stream = new MediaStream();
        stream.addTrack(track.getTrack());
        video.srcObject = stream;
        video.play();
        remoteVideoAttached = true;
        processVideo();
    }
}

// --- End Jitsi integration ---

var graphData = {
  type: "bar",
  data: {
    labels: ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"].map(emotion => emotionTranslations[emotion]),
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
          "rgba(41, 42, 43, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(88, 87, 87)",
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
  `ws://127.0.0.1:8000/ws/graph/${session_id}/`
);
// Configurar WebSocket para manejar binarios
socket.binaryType = "arraybuffer";

socket.onopen = function (e) {
    // Add event listener to clear badge when alerts tab is clicked
    document.getElementById('alerts-tab').addEventListener('click', function() {
        const alertBadge = document.getElementById('alert-badge');
        alertBadge.textContent = '0';
        alertBadge.classList.add('d-none');
    });
}

// Function to display alerts
function displayAlerts(alerts) {
    const alertsList = document.getElementById('alerts-list');
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'list-group-item list-group-item-danger mb-2';
        alertElement.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">Alerta de ${emotionTranslations[alert.emotion]}</h5>
                <small>${new Date(alert.timestamp).toLocaleTimeString()}</small>
            </div>
            <p class="mb-1">Intensidad promedio: ${(alert.value * 100).toFixed(1)}%</p>
            <small class="text-muted">Detectado múltiples veces</small>
        `;
        alertsList.insertBefore(alertElement, alertsList.firstChild);
    });
}

socket.onmessage = function (e) {
    var djangoData = JSON.parse(e.data);
    
    // Actualizar el gráfico
    var newGraphData = graphData.data.datasets[0].data;
    newGraphData = djangoData.preds[0];

    graphData.data.datasets[0].data = newGraphData;
    myChart.update();

    // Display alerts if any
    if (djangoData.alerts && djangoData.alerts.length > 0) {
        displayAlerts(djangoData.alerts);
        // Update the alert badge
        const alertBadge = document.getElementById('alert-badge');
        alertBadge.classList.remove('d-none');
        const currentCount = parseInt(alertBadge.textContent);
        alertBadge.textContent = currentCount + djangoData.alerts.length;
    }
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

