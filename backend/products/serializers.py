"""
products/serializers.py
"""

from rest_framework import serializers
from .models import Category, Product, ProductImage, Review, Wishlist


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductImage
        fields = ['id', 'image', 'alt_text']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = ['id', 'user_name', 'rating', 'title', 'comment', 'created_at']
        read_only_fields = ['user']

    def get_user_name(self, obj):
        return obj.user.full_name or obj.user.email


class ProductSerializer(serializers.ModelSerializer):
    category_name    = serializers.CharField(source='category.name', read_only=True)
    images           = ProductImageSerializer(many=True, read_only=True)
    avg_rating       = serializers.ReadOnlyField()
    in_stock         = serializers.ReadOnlyField()
    discounted_price = serializers.ReadOnlyField()
    review_count     = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = ['id', 'name', 'slug', 'category', 'category_name', 'description',
                  'price', 'discount', 'discounted_price', 'stock', 'in_stock',
                  'image', 'images', 'brand', 'is_featured', 'avg_rating',
                  'review_count', 'created_at']

    def get_review_count(self, obj):
        return obj.reviews.count()


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model  = Wishlist
        fields = ['id', 'product', 'added_at']
