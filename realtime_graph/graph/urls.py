from django.urls import path

from .views import index, history, real_time, redirect_view


urlpatterns= [
    path ('', index),
    path('redirect_view/', redirect_view, name='redirect_view'),
    path ('real_time/<str:session_id>/', real_time, name='real_time'),
    path('history/<str:session_id>/', history, name='history'),
]