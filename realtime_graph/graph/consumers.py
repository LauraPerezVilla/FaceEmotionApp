import json
from random import randint
from asyncio import sleep
from channels.generic.websocket import AsyncWebsocketConsumer
from .model import FaceEmotionModel, NpEncoder
import cv2
import imutils
import numpy as np
from urllib.parse import parse_qs

class GraphConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        url_params = parse_qs(self.scope['query_string'].decode())
        video_url = url_params["video_url"][0]

        # Captura de video
        cam = cv2.VideoCapture(str(video_url), cv2.CAP_ANY)

        face_model = FaceEmotionModel()

        while True:
            ret, frame = cam.read()
            frame = imutils.resize(frame, width=640)
            locs, preds = face_model.predict_emotion(frame)

            await self.send(json.dumps({'loc': locs, 'preds': preds}, cls=NpEncoder))
            await sleep(0.3)