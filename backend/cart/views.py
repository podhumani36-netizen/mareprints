"""
cart/views.py
Cart management: add, update quantity, remove, clear
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


class CartView(APIView):
    """
    GET  /api/cart/  - View cart
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)


class CartAddView(APIView):
    """
    POST /api/cart/add/
    Body: { product_id: 1, quantity: 2 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if quantity > product.stock:
            return Response({'error': f'Only {product.stock} items available'},
                            status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity

        item.save()

        return Response({'success': True, 'message': 'Added to cart',
                         'cart': CartSerializer(cart).data})


class CartUpdateView(APIView):
    """
    PUT /api/cart/update/<item_id>/
    Body: { quantity: 3 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        quantity = int(request.data.get('quantity', 1))

        if quantity <= 0:
            item.delete()
            return Response({'success': True, 'message': 'Item removed'})

        if quantity > item.product.stock:
            return Response({'error': f'Only {item.product.stock} items available'},
                            status=status.HTTP_400_BAD_REQUEST)

        item.quantity = quantity
        item.save()

        cart = Cart.objects.get(user=request.user)
        return Response({'success': True, 'cart': CartSerializer(cart).data})


class CartRemoveView(APIView):
    """DELETE /api/cart/remove/<item_id>/"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        CartItem.objects.filter(id=item_id, cart__user=request.user).delete()
        cart = Cart.objects.get(user=request.user)
        return Response({'success': True, 'cart': CartSerializer(cart).data})


class CartClearView(APIView):
    """DELETE /api/cart/clear/  - Remove all items"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'success': True, 'message': 'Cart cleared'})
