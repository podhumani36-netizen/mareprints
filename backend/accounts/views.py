from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTP, Address
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer,
    ChangePasswordSerializer, AddressSerializer
)

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'success': True,
                'message': 'Account created successfully',
                'tokens': tokens,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        return Response({'success': False, 'errors': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response({'success': False, 'error': 'Invalid email or password'},
                            status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'success': False, 'error': 'Account is disabled'},
                            status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        return Response({
            'success': True,
            'message': 'Login successful',
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'success': True, 'message': 'Logged out successfully'})
        except Exception:
            return Response({'success': False, 'error': 'Invalid token'},
                            status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'success': True,
                             'message': 'If this email exists, an OTP has been sent'})

        OTP.objects.filter(user=user, is_used=False).update(is_used=True)

        otp_code = OTP.generate_code()
        OTP.objects.create(user=user, code=otp_code)

        send_mail(
            subject='Password Reset OTP - E-Commerce',
            message=f'Your OTP for password reset is: {otp_code}\n\nThis OTP is valid for 10 minutes.\n\nDo not share this OTP with anyone.',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({
            'success': True,
            'message': 'OTP sent to your email address'
        })


class VerifyOTPView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'success': False, 'error': 'User not found'},
                            status=status.HTTP_404_NOT_FOUND)

        try:
            otp = OTP.objects.filter(user=user, code=otp_code, is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({'success': False, 'error': 'Invalid OTP'},
                            status=status.HTTP_400_BAD_REQUEST)

        if otp.is_expired():
            return Response({'success': False, 'error': 'OTP has expired. Please request a new one'},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True, 'message': 'OTP verified successfully'})


class ResetPasswordView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'success': False, 'error': 'User not found'},
                            status=status.HTTP_404_NOT_FOUND)

        try:
            otp = OTP.objects.filter(user=user, code=otp_code, is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({'success': False, 'error': 'Invalid OTP'},
                            status=status.HTTP_400_BAD_REQUEST)

        if otp.is_expired():
            return Response({'success': False, 'error': 'OTP has expired'},
                            status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        otp.is_used = True
        otp.save()

        return Response({'success': True, 'message': 'Password reset successfully'})


class ProfileView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'success': True, 'user': serializer.data})

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'user': serializer.data})
        return Response({'success': False, 'errors': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response({'success': False, 'error': 'Old password is incorrect'},
                            status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response({'success': True, 'message': 'Password changed successfully'})


class AddressListCreateView(generics.ListCreateAPIView):

    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)