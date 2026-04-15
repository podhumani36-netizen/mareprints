"""
payments/views.py
Razorpay Create Order + Verify Payment + Email Notification with Preview Image
"""

import base64
import hashlib
import hmac
import logging
import re

import razorpay
from django.conf import settings
from django.core.mail import EmailMessage
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order

logger = logging.getLogger(__name__)

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def build_customer_email_message(customer_details, razorpay_order_id, payment_id):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
        <h2 style="color:#2C7FB8;">Order Placed Successfully 🎉</h2>

        <p>Dear {customer_details.get('name') or customer_details.get('fullName', 'Customer')},</p>
        <p>Thank you for your order with MARE Prints!</p>
        <p>Your order has been confirmed and is now under processing. </p>
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

        <p>Processing Time: 2–5 business days  </p>
        <p>Delivery Time: Based on location</p>
        <p style="margin-top:20px;">
            We will share tracking details once your order is shipped. 
        </p>

        <p>Thank you for trusting us to create your custom product    </p>
    </body>
    </html>
    """.strip()


def build_admin_email_message(customer_details, razorpay_order_id, payment_id):
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
        <p><b>Name:</b> {customer_details.get('name') or customer_details.get('fullName', '')}</p>
        <p><b>Email:</b> {customer_details.get('email', '')}</p>
        <p><b>Phone:</b> {customer_details.get('phone', '')}</p>
        <p><b>Alternate Phone:</b> {customer_details.get('alternatePhone', '')}</p>

        <h3>Address</h3>
        <p><b>Address:</b> {customer_details.get('address', '')}</p>
        <p><b>Alternate Address:</b> {customer_details.get('alternateAddress', '')}</p>
        <p><b>City:</b> {customer_details.get('city', '')}</p>
        <p><b>State:</b> {customer_details.get('state', '')}</p>
        <p><b>Pincode:</b> {customer_details.get('pincode', '')}</p>

       
        <p style="margin-top:20px;">
            Preview image attachment is included with this email.
        </p>

        <p><b>Mare Prints Admin Notification</b></p>
    </body>
    </html>
    """.strip()


def get_attachment_from_base64(image_data, filename_base="image"):
    if not image_data:
        return None

    match = re.match(r"^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$", image_data)
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
        filename = f"{filename_base}.{extension}"
        return (filename, file_data, mime_type)
    except Exception:
        logger.exception(f"Failed to decode image: {filename_base}")
        return None


def send_payment_emails(customer_details, razorpay_order_id, payment_id, preview_images=None, uploaded_images=None):
    preview_images = preview_images or []
    uploaded_images = uploaded_images or []

    customer_email = (customer_details.get("email") or "").strip()
    admin_email = getattr(settings, "ADMIN_EMAIL", settings.EMAIL_HOST_USER)

    logger.info("=== EMAIL SEND STARTED ===")
    logger.info(f"Customer email: {customer_email}")
    logger.info(f"Admin email: {admin_email}")
    logger.info(f"Razorpay Order ID: {razorpay_order_id}")
    logger.info(f"Payment ID: {payment_id}")
    logger.info(f"Preview images count: {len(preview_images)}")
    logger.info(f"Uploaded images count: {len(uploaded_images)}")

    customer_subject = f"Payment Successful - Mare Prints - {payment_id}"
    admin_subject = f"New Order Payment Received - {payment_id}"

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

    # Build numbered attachment tuples: (preview_1, original_1), (preview_2, original_2), ...
    attachments = []
    count = max(len(preview_images), len(uploaded_images))
    for i in range(count):
        n = "" if count == 1 else f"_{i + 1}"
        preview_att = get_attachment_from_base64(
            preview_images[i] if i < len(preview_images) else None,
            f"customized_preview{n}",
        )
        original_att = get_attachment_from_base64(
            uploaded_images[i] if i < len(uploaded_images) else None,
            f"original_image{n}",
        )
        if preview_att:
            attachments.append(("preview", preview_att))
        if original_att:
            attachments.append(("original", original_att))

    logger.info(f"Total attachments prepared: {len(attachments)}")

    customer_sent = False
    admin_sent = False
    errors = []

    try:
        if customer_email:
            customer_mail = EmailMessage(
                subject=customer_subject,
                body=customer_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[customer_email],
            )
            customer_mail.content_subtype = "html"

            for label, attachment in attachments:
                try:
                    customer_mail.attach(*attachment)
                    logger.info(f"Customer {label} attachment '{attachment[0]}' attached")
                except Exception as attach_error:
                    logger.exception(f"Customer {label} attachment error")
                    errors.append(f"Customer {label} attachment error: {str(attach_error)}")

            customer_mail.send(fail_silently=False)
            customer_sent = True
            logger.info("Customer mail sent successfully")
        else:
            logger.warning("Customer email missing")
            errors.append("Customer email missing")

    except Exception as e:
        logger.exception("Customer mail send failed")
        errors.append(f"Customer mail send failed: {str(e)}")

    try:
        if admin_email:
            admin_mail = EmailMessage(
                subject=admin_subject,
                body=admin_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[admin_email],
            )
            admin_mail.content_subtype = "html"

            for label, attachment in attachments:
                try:
                    admin_mail.attach(*attachment)
                    logger.info(f"Admin {label} attachment '{attachment[0]}' attached")
                except Exception as attach_error:
                    logger.exception(f"Admin {label} attachment error")
                    errors.append(f"Admin {label} attachment error: {str(attach_error)}")

            admin_mail.send(fail_silently=False)
            admin_sent = True
            logger.info("Admin mail sent successfully")
        else:
            logger.warning("Admin email missing")
            errors.append("Admin email missing")

    except Exception as e:
        logger.exception("Admin mail send failed")
        errors.append(f"Admin mail send failed: {str(e)}")

    logger.info(f"=== EMAIL SEND FINISHED | customer_sent={customer_sent} | admin_sent={admin_sent} ===")

    return {
        "customer_sent": customer_sent,
        "admin_sent": admin_sent,
        "email_sent": customer_sent or admin_sent,
        "email_error": " | ".join(errors) if errors else None,
    }


class CreateOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            amount = request.data.get("amount")

            if amount is None or amount == "":
                return Response(
                    {"error": "Amount is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            amount = float(amount)

            if amount <= 0:
                return Response(
                    {"error": "Invalid amount"},
                    status=status.HTTP_400_BAD_REQUEST,
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
            logger.exception("CreateOrderView failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PaymentVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        payment_id = request.data.get("payment_id")
        signature = request.data.get("signature")
        customer_details = request.data.get("customerDetails", {})

        # Support both array (multi-image) and single-image payloads
        preview_images = request.data.get("previewImages") or []
        uploaded_images = request.data.get("uploadedImages") or []

        # Backward compat: single-image keys
        if not preview_images:
            single = request.data.get("previewImage", "")
            if single:
                preview_images = [single]
        if not uploaded_images:
            single = request.data.get("uploadedImage", "")
            if single:
                uploaded_images = [single]

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
                    clean_id = str(website_order_id).replace("#ORD", "").strip()

                    if clean_id.isdigit():
                        order = Order.objects.get(id=int(clean_id))
                        order.is_paid = True
                        order.payment_id = payment_id
                        order.status = "confirmed"
                        order.save()
                    else:
                        logger.warning(f"Invalid order ID format: {website_order_id}")

                except Order.DoesNotExist:
                    logger.warning(f"Order not found: {website_order_id}")
                except Exception as e:
                    logger.exception(f"Order update failed: {e}")

            email_result = send_payment_emails(
                customer_details=customer_details,
                razorpay_order_id=order_id,
                payment_id=payment_id,
                preview_images=preview_images,
                uploaded_images=uploaded_images,
            )

            return Response(
                {
                    "success": True,
                    "message": "Payment verified successfully",
                    "email_sent": email_result["email_sent"],
                    "customer_sent": email_result["customer_sent"],
                    "admin_sent": email_result["admin_sent"],
                    "email_error": email_result["email_error"],
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.exception("PaymentVerifyView failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )