from django import template
from django.utils import timezone

register = template.Library()

@register.filter
def multiply(value, arg):
    """Multiply the value by the argument"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return ''

@register.filter
def localtime(value):
    """Convert datetime to local time in 12-hour format"""
    if value:
        return timezone.localtime(value).strftime('%I:%M:%S %p')
    return value 