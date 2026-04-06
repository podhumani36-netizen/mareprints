"""
payments/views.py
Razorpay Create Order + Verify Payment + Email Notification with Preview Image
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


def build_customer_email_message(customer_details, razorpay_order_id, payment_id, preview_image=None):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
        <h2 style="color:#2C7FB8;">Payment Successful 🎉</h2>

        <p>Dear {customer_details.get('name', 'Customer')},</p>
        <p>Your payment was successful.</p>

        <h3>Order Details</h3>
        <p><b>Website Order ID:</b> {customer_details.get('orderId', '')}</p>
        <p><b>Razorpay Order ID:</b> {razorpay_order_id}</p>
        <p><b>Payment ID:</b> {payment_id}</p>

        <h3>Product Details</h3>
        <p><b>Product Name:</b> {customer_details.get('productName', '')}</p>
        <p><b>Product Type:</b> {customer_details.get('productType', '')}</p>
        <p><b>Orientation:</b> {customer_details.get('orientation', '')}</p>
        <p><b>Size:</b> {customer_details.get('size', '')}</p>
        <p><b>Thickness:</b> {customer_details.get('thickness', '')}</p>
        <p><b>Quantity:</b> {customer_details.get('quantity', '')}</p>
        <p><b>Amount Paid:</b> ₹{customer_details.get('amount', '')}</p>

        <h3>Customer Details</h3>
        <p><b>Name:</b> {customer_details.get('name', '')}</p>
        <p><b>Email:</b> {customer_details.get('email', '')}</p>
        <p><b>Phone:</b> {customer_details.get('phone', '')}</p>
        <p><b>Alternate Phone:</b> {customer_details.get('alternatePhone', '')}</p>

        <h3>Address</h3>
        <p><b>Address:</b> {customer_details.get('address', '')}</p>
        <p><b>Alternate Address:</b> {customer_details.get('alternateAddress', '')}</p>
        <p><b>City:</b> {customer_details.get('city', '')}</p>
        <p><b>State:</b> {customer_details.get('state', '')}</p>
        <p><b>Pincode:</b> {customer_details.get('pincode', '')}</p>

        <h3>Customization</h3>
        <p><b>Zoom:</b> {customer_details.get('imageZoom', '')}</p>
        <p><b>Image Offset X:</b> {customer_details.get('imageOffsetX', '')}</p>
        <p><b>Image Offset Y:</b> {customer_details.get('imageOffsetY', '')}</p>

        <p style="margin-top:20px;">
            Your customized preview image is attached with this email.
        </p>

        <p>Regards,<br><b>Mare Prints</b></p>
    </body>
    </html>
    """.strip()


def build_admin_email_message(customer_details, razorpay_order_id, payment_id, preview_image=None):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
        <h2 style="color:#2C7FB8;">New Order Payment Received</h2>

        <p><b>Website Order ID:</b> {customer_details.get('orderId', '')}</p>
        <p><b>Razorpay Order ID:</b> {razorpay_order_id}</p>
        <p><b>Payment ID:</b> {payment_id}</p>
        <p><b>Amount Paid:</b> ₹{customer_details.get('amount', '')}</p>

        <h3>Product Details</h3>
        <p><b>Product Name:</b> {customer_details.get('productName', '')}</p>
        <p><b>Product Type:</b> {customer_details.get('productType', '')}</p>
        <p><b>Orientation:</b> {customer_details.get('orientation', '')}</p>
        <p><b>Size:</b> {customer_details.get('size', '')}</p>
        <p><b>Thickness:</b> {customer_details.get('thickness', '')}</p>
        <p><b>Quantity:</b> {customer_details.get('quantity', '')}</p>

        <h3>Customer Details</h3>
        <p><b>Name:</b> {customer_details.get('name', '')}</p>
        <p><b>Email:</b> {customer_details.get('email', '')}</p>
        <p><b>Phone:</b> {customer_details.get('phone', '')}</p>
        <p><b>Alternate Phone:</b> {customer_details.get('alternatePhone', '')}</p>

        <h3>Address</h3>
        <p><b>Address:</b> {customer_details.get('address', '')}</p>
        <p><b>Alternate Address:</b> {customer_details.get('alternateAddress', '')}</p>
        <p><b>City:</b> {customer_details.get('city', '')}</p>
        <p><b>State:</b> {customer_details.get('state', '')}</p>
        <p><b>Pincode:</b> {customer_details.get('pincode', '')}</p>

        <h3>Customization</h3>
        <p><b>Zoom:</b> {customer_details.get('imageZoom', '')}</p>
        <p><b>Image Offset X:</b> {customer_details.get('imageOffsetX', '')}</p>
        <p><b>Image Offset Y:</b> {customer_details.get('imageOffsetY', '')}</p>

        <p style="margin-top:20px;">
            Preview image attachment is included with this email.
        </p>

        <p><b>Mare Prints Admin Notification</b></p>
    </body>
    </html>
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
    customer_email = (customer_details.get("email") or "").strip()
    admin_email = (getattr(settings, "ADMIN_EMAIL", settings.EMAIL_HOST_USER) or "").strip()

    customer_subject = "Payment Successful - Mare Prints"
    admin_subject = f"New Order Payment Received - {customer_details.get('orderId', 'Mare Prints')}"

    customer_message = build_customer_email_message(
        customer_details,
        razorpay_order_id,
        payment_id,
        preview_image,
    )

    admin_message = build_admin_email_message(
        customer_details,
        razorpay_order_id,
        payment_id,
        preview_image,
    )

    attachment = get_attachment_from_base64(preview_image)

    if customer_email:
        customer_mail = EmailMessage(
            subject=customer_subject,
            body=customer_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[customer_email],
        )
        customer_mail.content_subtype = "html"

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
        admin_mail.content_subtype = "html"

        if attachment:
            admin_mail.attach(*attachment)

        admin_mail.send(fail_silently=False)


class CreateOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            amount = request.data.get("amount")

            if amount is None or amount == "":
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
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
                f"{order_id}|{payment_id}".encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()

            if generated_signature != signature:
                return Response(
                    {"error": "Invalid payment signature"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            website_order_id = customer_details.get("orderId")
            if website_order_id:
                try:
                    order = Order.objects.get(id=website_order_id)
                    order.is_paid = True
                    order.payment_id = payment_id
                    order.status = "confirmed"
                    order.save()
                except Order.DoesNotExist:
                    pass

            email_sent = True
            email_error = None

            try:
                send_payment_emails(
                    customer_details=customer_details,
                    razorpay_order_id=order_id,
                    payment_id=payment_id,
                    preview_image=preview_image,
                )
            except Exception as mail_error:
                email_sent = False
                email_error = str(mail_error)
                print("MAIL SEND ERROR:", mail_error)

            return Response(
                {
                    "success": True,
                    "message": "Payment verified successfully",
                    "email_sent": email_sent,
                    "email_error": email_error,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )