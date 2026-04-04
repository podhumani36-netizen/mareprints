"""
payments/views.py
Razorpay Create Order + Verify Payment
"""

import hmac
import hashlib
import razorpay

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from orders.models import Order


client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class CreateOrderView(APIView):
    """
    POST /api/payments/create-order/
    Body: { amount }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            amount = request.data.get("amount")

            if not amount:
                return Response(
                    {"error": "Amount is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            amount = float(amount)

            if amount <= 0:
                return Response(
                    {"error": "Invalid amount"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            razorpay_order = client.order.create({
                "amount": int(amount * 100),
                "currency": "INR",
                "payment_capture": 1,
            })

            return Response({
                "id": razorpay_order["id"],
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"],
                "key": settings.RAZORPAY_KEY_ID,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentVerifyView(APIView):
    """
    POST /api/payments/verify/
    Body: { order_id, payment_id, signature }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        payment_id = request.data.get("payment_id")
        signature = request.data.get("signature")

        if not order_id or not payment_id or not signature:
            return Response(
                {"error": "order_id, payment_id and signature are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
                f"{order_id}|{payment_id}".encode("utf-8"),
                hashlib.sha256
            ).hexdigest()

            if generated_signature != signature:
                return Response(
                    {"error": "Invalid payment signature"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Optional: Order update logic
            # If your local Order model id is different from Razorpay order id,
            # remove this block or store mapping separately.
            try:
                order = Order.objects.get(id=order_id)
                order.is_paid = True
                order.payment_id = payment_id
                order.status = "confirmed"
                order.save()
            except Order.DoesNotExist:
                pass

            return Response({
                "success": True,
                "message": "Payment verified successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )