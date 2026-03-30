"""
orders/serializers.py
"""

from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'order_number', 'status', 'shipping_name', 'shipping_phone',
                  'shipping_address', 'shipping_city', 'shipping_state', 'shipping_pincode',
                  'subtotal', 'shipping_cost', 'total_amount', 'payment_method', 'is_paid',
                  'payment_id', 'notes', 'items', 'created_at']
        read_only_fields = ['order_number', 'status', 'is_paid', 'payment_id']


class CreateOrderSerializer(serializers.Serializer):
    """Validates data when placing a new order"""
    address_id     = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['cod', 'online', 'wallet'])
    notes          = serializers.CharField(required=False, allow_blank=True)
