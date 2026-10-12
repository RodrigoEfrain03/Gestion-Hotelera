from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, me

router = DefaultRouter()
router.register('usuarios', UserViewSet, basename='usuario')

urlpatterns = [
    path('auth/me/', me, name='auth-me'),
    path('', include(router.urls)),
]
