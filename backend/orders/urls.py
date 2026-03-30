from django.urls import path
from . import views

urlpatterns = [
    path('orders/',                       views.OrderListView.as_view(),   name='order-list'),
    path('orders/place/',                 views.PlaceOrderView.as_view(),  name='place-order'),
    path('orders/<int:pk>/',              views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:order_id>/cancel/', views.CancelOrderView.as_view(), name='cancel-order'),
]
