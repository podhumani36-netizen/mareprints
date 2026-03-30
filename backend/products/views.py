"""
products/views.py
Product listing, detail, search, reviews, wishlist
"""

from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Category, Product, Review, Wishlist
from .serializers import (
    CategorySerializer, ProductSerializer, ReviewSerializer, WishlistSerializer
)


# ─── CATEGORIES ───────────────────────────────────────────────────────────────
class CategoryListView(generics.ListAPIView):
    """GET /api/categories/  - All active categories"""
    queryset           = Category.objects.filter(is_active=True)
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]


# ─── PRODUCTS ─────────────────────────────────────────────────────────────────
class ProductListView(generics.ListAPIView):
    """
    GET /api/products/
    Supports: ?search=phone  ?category=1  ?min_price=100  ?max_price=5000
              ?ordering=-price  ?featured=true
    """
    serializer_class   = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['category', 'brand', 'is_featured']
    search_fields      = ['name', 'description', 'brand']
    ordering_fields    = ['price', 'created_at', 'name']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        return qs


class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/products/<slug>/  - Single product"""
    queryset           = Product.objects.filter(is_active=True)
    serializer_class   = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'slug'


class FeaturedProductsView(generics.ListAPIView):
    """GET /api/products/featured/  - Featured products for home page"""
    queryset           = Product.objects.filter(is_active=True, is_featured=True)
    serializer_class   = ProductSerializer
    permission_classes = [permissions.AllowAny]


# ─── REVIEWS ──────────────────────────────────────────────────────────────────
class ProductReviewView(APIView):
    """
    GET  /api/products/<id>/reviews/  - Get all reviews
    POST /api/products/<id>/reviews/  - Add review (auth required)
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id)
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({'error': 'You have already reviewed this product'},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── WISHLIST ─────────────────────────────────────────────────────────────────
class WishlistView(APIView):
    """
    GET    /api/wishlist/          - Get all wishlisted products
    POST   /api/wishlist/          - Add product to wishlist  { product_id: 1 }
    DELETE /api/wishlist/<id>/     - Remove from wishlist
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist = Wishlist.objects.filter(user=request.user)
        return Response(WishlistSerializer(wishlist, many=True).data)

    def post(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        wishlist, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        if not created:
            return Response({'message': 'Already in wishlist'})

        return Response({'success': True, 'message': 'Added to wishlist'},
                        status=status.HTTP_201_CREATED)

    def delete(self, request, product_id):
        Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
        return Response({'success': True, 'message': 'Removed from wishlist'})
