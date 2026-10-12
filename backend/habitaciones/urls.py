from rest_framework.routers import DefaultRouter
from .views import HabitacionViewSet

router = DefaultRouter()
router.register(r'habitaciones', HabitacionViewSet)

urlpatterns = router.urls
