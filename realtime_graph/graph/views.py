from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Prediction
from django.db.models import Avg
import json

def index(request):
    return render(request, 'base.html', context={'text':'Hello World'})

def redirect_view(request):
    session_id = request.GET.get('session_id')
    view = request.GET.get('view')
    if view == 'real_time':
        return redirect('real_time', session_id=session_id)
    elif view == 'history':
        return redirect('history', session_id=session_id)
    else:
        return render(request, 'base.html', {'error': 'Invalid view selected'})

def real_time(request, session_id):
    return render(request, 'real_time.html', context={'session_id': session_id})

def history(request, session_id):
    # Fetch all predictions for the given session_id
    predictions = Prediction.objects.filter(session_id=session_id)

    # Calculate the average of the predictions for the given session_id
    averages = predictions.aggregate(
        avg_angry=Avg('angry'),
        avg_disgust=Avg('disgust'),
        avg_fear=Avg('fear'),
        avg_happy=Avg('happy'),
        avg_neutral=Avg('neutral'),
        avg_sad=Avg('sad'),
        avg_surprise=Avg('surprise')
    )
    
    return render(request, 'history.html', {'averages': json.dumps(averages), 'session_id': session_id})