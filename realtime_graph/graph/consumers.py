import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .model import FaceEmotionModel, NpEncoder
import cv2
import numpy as np
from .models import Session, Prediction
import asyncio

classes = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

class GraphConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Obtenemos el id de la sesión
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        # Creamos la sesion en la base de datos
        await self.create_session(self.session_id)

        # Initialize the list to accumulate predictions
        self.predictions = []
        # Start the background task to save predictions in batches
        self.save_predictions_task = asyncio.create_task(self.save_predictions_periodically())

        await self.accept()
    
    @database_sync_to_async
    def create_session(self, session_id):
        return Session.objects.create(session_id=session_id)

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
            (angry,disgust,fear,happy,neutral,sad,surprise) = pred
            # Accumulate the predictions
            self.predictions.append({
                'session_id': self.session_id,
                'angry': float(angry),
                'disgust': float(disgust),
                'fear': float(fear),
                'happy': float(happy),
                'neutral': float(neutral),
                'sad': float(sad),
                'surprise': float(surprise),
                'full_response': pred.tolist(),
                'created_at': np.datetime64('now').astype(str)
            })
            cv2.rectangle(frame_bgr, (Xi, Yi-40), (Xf, Yi), (255, 0, 0), -1)
            cv2.putText(frame_bgr, label, (Xi+5, Yi-15), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.rectangle(frame_bgr, (Xi, Yi), (Xf, Yf), (255, 0, 0), 3)
        cv2.imshow("Frame predecido", frame_bgr)
        cv2.waitKey(1)  # Mantiene la ventana activa

        # Enviamos la predicción al cliente
        await self.send(text_data=json.dumps({'loc': locs, 'preds': preds}, cls=NpEncoder))

    async def save_predictions_periodically(self):
        while True:
            await asyncio.sleep(10)  # Save predictions every 10 seconds
            if self.predictions:
                await self.save_predictions()

    @database_sync_to_async
    def save_predictions(self):
        Prediction.objects.bulk_create([
            Prediction(
                session_id=prediction['session_id'],
                angry=prediction['angry'],
                disgust=prediction['disgust'],
                fear=prediction['fear'],
                happy=prediction['happy'],
                neutral=prediction['neutral'],
                sad=prediction['sad'],
                surprise=prediction['surprise'],
                full_response=prediction['full_response'],
                created_at=prediction['created_at']
            )
            for prediction in self.predictions
        ])
        self.predictions = []
    
    async def disconnect(self, close_code):
        # Cancel the background task when the connection is closed
        self.save_predictions_task.cancel()
        await self.save_predictions()