import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .model import FaceEmotionModel, NpEncoder
import cv2
import numpy as np

classes = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

class GraphConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
    
    async def receive(self, bytes_data):
        # Convertir los bytes a un numpy array (como uint8)
        np_array = np.frombuffer(bytes_data, dtype=np.uint8)
        frame = np_array.reshape((240, 320, 3))  # Ajustar dimensiones
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)  # Convertir a BGR
        
        # Hacemos la predicción
        face_model = FaceEmotionModel()
        locs, preds = face_model.predict_emotion(frame_bgr)
        
        # Depuración
        for (box, pred) in zip(locs, preds):
            label = "{}: {:.0f}%".format(classes[np.argmax(pred)], max(pred) * 100)
            (Xi, Yi, Xf, Yf) = box
            cv2.rectangle(frame_bgr, (Xi, Yi-40), (Xf, Yi), (255, 0, 0), -1)
            cv2.putText(frame_bgr, label, (Xi+5, Yi-15), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.rectangle(frame_bgr, (Xi, Yi), (Xf, Yf), (255, 0, 0), 3)
        cv2.imshow("Frame predecido", frame_bgr)
        cv2.waitKey(1)  # Mantiene la ventana activa

        # Enviamos la predicción al cliente
        await self.send(text_data=json.dumps({'loc': locs, 'preds': preds}, cls=NpEncoder))

