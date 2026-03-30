from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'price', 'quantity', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ['order_number', 'user', 'status', 'total_amount', 'is_paid', 'created_at']
    list_filter    = ['status', 'is_paid', 'payment_method']
    search_fields  = ['order_number', 'user__email']
    readonly_fields = ['order_number', 'created_at']
    inlines        = [OrderItemInline]
