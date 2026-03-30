"""
cart/models.py

Cart logic:
- Each user has ONE Cart
- Cart has multiple CartItems (product + quantity)
"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Cart(models.Model):
    """One cart per user"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    def __str__(self):
        return f"Cart of {self.user.email}"


class CartItem(models.Model):
    """Individual item in a cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def subtotal(self):
        return round(self.product.discounted_price * self.quantity, 2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"