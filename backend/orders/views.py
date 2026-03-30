"""
orders/views.py
Place order, list orders, order detail, cancel order
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from accounts.models import Address
from cart.models import Cart


class PlaceOrderView(APIView):
    """
    POST /api/orders/place/
    Body: { address_id: 1, payment_method: "cod", notes: "" }

    Flow:
    1. Get user's cart items
    2. Validate address belongs to user
    3. Create Order + OrderItems (price snapshot)
    4. Reduce product stock
    5. Clear the cart
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            address = Address.objects.get(id=data['address_id'], user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        for item in cart_items:
            if item.quantity > item.product.stock:
                return Response(
                    {'error': f'Only {item.product.stock} units of "{item.product.name}" available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        subtotal = sum(item.subtotal for item in cart_items)
        shipping_cost = 0 if subtotal >= 500 else 50
        total_amount = subtotal + shipping_cost

        order = Order.objects.create(
            user=request.user,
            order_number=Order.generate_order_number(),
            shipping_name=address.full_name,
            shipping_phone=address.phone,
            shipping_address=address.address_line,
            shipping_city=address.city,
            shipping_state=address.state,
            shipping_pincode=address.pincode,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            payment_method=data['payment_method'],
            notes=data.get('notes', ''),
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_image=str(item.product.image) if item.product.image else '',
                price=item.product.discounted_price,
                quantity=item.quantity,
            )
            item.product.stock -= item.quantity
            item.product.save()

        cart.items.all().delete()

        return Response({
            'success': True,
            'message': 'Order placed successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """GET /api/orders/  - All orders of logged in user"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/<id>/  - Single order detail"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CancelOrderView(APIView):
    """
    POST /api/orders/<id>/cancel/
    Only pending/confirmed orders can be cancelled
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ['pending', 'confirmed']:
            return Response({'error': f'Cannot cancel order with status "{order.status}"'},
                            status=status.HTTP_400_BAD_REQUEST)

        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()

        order.status = 'cancelled'
        order.save()

        return Response({'success': True, 'message': 'Order cancelled successfully'})