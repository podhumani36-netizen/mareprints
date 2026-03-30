from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP, Address


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display   = ['email', 'first_name', 'last_name', 'is_active', 'date_joined']
    list_filter    = ['is_active', 'is_staff']
    search_fields  = ['email', 'first_name', 'last_name']
    ordering       = ['-date_joined']
    fieldsets      = (
        (None,           {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'profile_pic')}),
        ('Permissions',  {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets  = (
        (None, {'classes': ('wide',), 'fields': ('email', 'password1', 'password2')}),
    )


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display  = ['user', 'code', 'created_at', 'is_used']
    list_filter   = ['is_used']


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display  = ['user', 'full_name', 'city', 'state', 'is_default']
