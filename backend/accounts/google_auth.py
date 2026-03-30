"""
accounts/google_auth.py
Google OAuth2 Login
Uses your Google Client credentials to verify the token and log in / register the user.
"""

import requests
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

GOOGLE_CLIENT_ID = "730804878496-opudg8u44obs5pt74cre44g36g25n9jf.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class GoogleLoginView(APIView):
    """
    POST /api/google-login/

    TWO WAYS to use this:

    WAY 1: Frontend sends Authorization Code (Recommended)
    Body: { "code": "<authorization_code_from_google>", "redirect_uri": "http://localhost:3000" }
    Django exchanges code -> gets access token -> gets user info -> login/register

    WAY 2: Frontend sends Access Token directly
    Body: { "access_token": "<google_access_token>" }
    Django uses token to get user info -> login/register
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        access_token = request.data.get('access_token')
        redirect_uri = request.data.get('redirect_uri', 'http://localhost:3000')

        if code:
            token_response = requests.post(GOOGLE_TOKEN_URL, data={
                'code': code,
                'client_id': GOOGLE_CLIENT_ID,
                'client_secret': GOOGLE_CLIENT_SECRET,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code',
            })
            token_data = token_response.json()

            if 'error' in token_data:
                return Response(
                    {'success': False, 'error': token_data.get('error_description', 'Google auth failed')},
                    status=status.HTTP_400_BAD_REQUEST
                )
            access_token = token_data.get('access_token')

        if not access_token:
            return Response(
                {'success': False, 'error': 'Provide either code or access_token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        userinfo_response = requests.get(
            GOOGLE_USERINFO_URL,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if userinfo_response.status_code != 200:
            return Response(
                {'success': False, 'error': 'Failed to get user info from Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        google_data = userinfo_response.json()
        email = google_data.get('email')
        first_name = google_data.get('given_name', '')
        last_name = google_data.get('family_name', '')

        if not email:
            return Response(
                {'success': False, 'error': 'Could not get email from Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            }
        )

        if not created and not user.first_name:
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        tokens = get_tokens_for_user(user)

        from .serializers import UserSerializer
        return Response({
            'success': True,
            'message': 'Registered via Google' if created else 'Logged in via Google',
            'is_new': created,
            'tokens': tokens,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)