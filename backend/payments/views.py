"""
payments/views.py
Razorpay Create Order + Verify Payment + Email Notification with Preview Attachment
"""

import base64
import hashlib
import hmac
import re

import razorpay
from django.conf import settings
from django.core.mail import EmailMessage
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order


client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def build_customer_email_message(customer_details, razorpay_order_id, payment_id):
    return f"""
Dear {customer_details.get('name', 'Customer')},

Your payment was successful.

Order Details:
--------------------------------
Website Order ID: {customer_details.get('orderId', '')}
Razorpay Order ID: {razorpay_order_id}
Payment ID: {payment_id}

Product Details:
--------------------------------
Product Name: {customer_details.get('productName', '')}
Product Type: {customer_details.get('productType', '')}
Orientation: {customer_details.get('orientation', '')}
Size: {customer_details.get('size', '')}
Thickness: {customer_details.get('thickness', '')}
Quantity: {customer_details.get('quantity', '')}
Amount Paid: ₹{customer_details.get('amount', '')}

Customer Details:
--------------------------------
Name: {customer_details.get('name', '')}
Email: {customer_details.get('email', '')}
Phone: {customer_details.get('phone', '')}
Alternate Phone: {customer_details.get('alternatePhone', '')}

Address:
--------------------------------
Address: {customer_details.get('address', '')}
Alternate Address: {customer_details.get('alternateAddress', '')}
City: {customer_details.get('city', '')}
State: {customer_details.get('state', '')}
Pincode: {customer_details.get('pincode', '')}

Customization:
--------------------------------
Zoom: {customer_details.get('imageZoom', '')}
Image Offset X: {customer_details.get('imageOffsetX', '')}
Image Offset Y: {customer_details.get('imageOffsetY', '')}

Your customized preview image is attached with this email.

Regards,
Mare Prints
""".strip()


def build_admin_email_message(customer_details, razorpay_order_id, payment_id):
    return f"""
New payment received on Mare Prints.

Payment Details:
--------------------------------
Website Order ID: {customer_details.get('orderId', '')}
Razorpay Order ID: {razorpay_order_id}
Payment ID: {payment_id}
Amount Paid: ₹{customer_details.get('amount', '')}

Product Details:
--------------------------------
Product Name: {customer_details.get('productName', '')}
Product Type: {customer_details.get('productType', '')}
Orientation: {customer_details.get('orientation', '')}
Size: {customer_details.get('size', '')}
Thickness: {customer_details.get('thickness', '')}
Quantity: {customer_details.get('quantity', '')}

Customer Details:
--------------------------------
Name: {customer_details.get('name', '')}
Email: {customer_details.get('email', '')}
Phone: {customer_details.get('phone', '')}
Alternate Phone: {customer_details.get('alternatePhone', '')}

Address:
--------------------------------
Address: {customer_details.get('address', '')}
Alternate Address: {customer_details.get('alternateAddress', '')}
City: {customer_details.get('city', '')}
State: {customer_details.get('state', '')}
Pincode: {customer_details.get('pincode', '')}

Customization:
--------------------------------
Zoom: {customer_details.get('imageZoom', '')}
Image Offset X: {customer_details.get('imageOffsetX', '')}
Image Offset Y: {customer_details.get('imageOffsetY', '')}

Customized preview image attached.
""".strip()


def get_attachment_from_base64(preview_image):
    if not preview_image:
        return None

    match = re.match(r"^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$", preview_image)
    if not match:
        return None

    mime_type = match.group(1)
    base64_data = match.group(2)

    extension_map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }

    extension = extension_map.get(mime_type, "jpg")

    try:
        file_data = base64.b64decode(base64_data)
        filename = f"customized_preview.{extension}"
        return (filename, file_data, mime_type)
    except Exception:
        return None


def send_payment_emails(customer_details, razorpay_order_id, payment_id, preview_image=None):
    customer_email = customer_details.get("email")
    admin_email = getattr(settings, "ADMIN_EMAIL", settings.EMAIL_HOST_USER)

    customer_subject = "Payment Successful - Mare Prints"
    admin_subject = f"New Order Payment Received - {customer_details.get('orderId', 'Mare Prints')}"

    customer_message = build_customer_email_message(
        customer_details,
        razorpay_order_id,
        payment_id,
    )

    admin_message = build_admin_email_message(
        customer_details,
        razorpay_order_id,
        payment_id,
    )

    attachment = get_attachment_from_base64(preview_image)

    if customer_email:
        customer_mail = EmailMessage(
            subject=customer_subject,
            body=customer_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[customer_email],
        )

        if attachment:
            customer_mail.attach(*attachment)

        customer_mail.send(fail_silently=False)

    if admin_email:
        admin_mail = EmailMessage(
            subject=admin_subject,
            body=admin_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
        )

        if attachment:
            admin_mail.attach(*attachment)

        admin_mail.send(fail_silently=False)


class CreateOrderView(APIView):
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
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        payment_id = request.data.get("payment_id")
        signature = request.data.get("signature")
        customer_details = request.data.get("customerDetails", {})
        preview_image = request.data.get("previewImage", "")

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

            try:
                order = Order.objects.get(id=order_id)
                order.is_paid = True
                order.payment_id = payment_id
                order.status = "confirmed"
                order.save()
            except Order.DoesNotExist:
                pass

            send_payment_emails(
                customer_details=customer_details,
                razorpay_order_id=order_id,
                payment_id=payment_id,
                preview_image=preview_image,
            )

            return Response({
                "success": True,
                "message": "Payment verified successfully and emails sent"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
