from django.urls import re_path
from .consumers import GraphConsumer

ws_urlpatterns = [
    re_path(r'ws/graph/(?P<session_id>\w+)/$', GraphConsumer.as_asgi()),
]