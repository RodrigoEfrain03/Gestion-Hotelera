from django.contrib import admin
from django.urls import path, include
from .views import dashboard_summary
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/', include('usuarios.urls')),
    path('api/dashboard/', dashboard_summary, name='dashboard-summary'),
    path('admin/', admin.site.urls),
    path('api/', include('clientes.urls')),
    path('api/', include('habitaciones.urls')),
    path('api/', include('reservas.urls')),
    path('api/', include('checkin_checkout.urls')),
    path('api/', include('pagos.urls')),
]
