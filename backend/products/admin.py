from django.contrib import admin
from .models import Category, Product, ProductImage, Review, Wishlist


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'slug', 'parent', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ['name', 'category', 'price', 'discount', 'stock', 'is_active', 'is_featured']
    list_filter    = ['category', 'is_active', 'is_featured']
    search_fields  = ['name', 'brand']
    prepopulated_fields = {'slug': ('name',)}
    inlines        = [ProductImageInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['user', 'product', 'rating', 'created_at']
