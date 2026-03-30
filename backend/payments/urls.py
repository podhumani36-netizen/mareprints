from django.urls import path
from . import views

urlpatterns = [
    path('payments/verify/', views.PaymentVerifyView.as_view(), name='payment-verify'),
]
