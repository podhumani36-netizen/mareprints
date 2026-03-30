"""
payments/views.py
Payment verification (Razorpay ready)
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from orders.models import Order


class PaymentVerifyView(APIView):
    """
    POST /api/payments/verify/
    Body: { order_id, payment_id, razorpay_signature }

    For now marks order as paid.
    Extend this with Razorpay signature verification.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        payment_id = request.data.get('payment_id')

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        order.is_paid = True
        order.payment_id = payment_id
        order.status = 'confirmed'
        order.save()

        return Response({'success': True, 'message': 'Payment verified successfully'})