from django.urls import path
from . import views

urlpatterns = [
    path('categories/',                         views.CategoryListView.as_view(),     name='categories'),
    path('products/',                           views.ProductListView.as_view(),      name='products'),
    path('products/featured/',                  views.FeaturedProductsView.as_view(), name='featured'),
    path('products/<slug:slug>/',               views.ProductDetailView.as_view(),    name='product-detail'),
    path('products/<int:product_id>/reviews/',  views.ProductReviewView.as_view(),    name='reviews'),
    path('wishlist/',                           views.WishlistView.as_view(),         name='wishlist'),
    path('wishlist/<int:product_id>/',          views.WishlistView.as_view(),         name='wishlist-delete'),
]
