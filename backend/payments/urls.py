from django.urls import path
from .views import CreateOrderView, PaymentVerifyView

urlpatterns = [
    path("payments/create-order/", CreateOrderView.as_view(), name="create-order"),
    path("payments/verify/", PaymentVerifyView.as_view(), name="payment-verify"),
]