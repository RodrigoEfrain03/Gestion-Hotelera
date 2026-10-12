from rest_framework.routers import DefaultRouter
from .views import CheckinCheckoutViewSet


router = DefaultRouter()

router.register(
    'checkins',
    CheckinCheckoutViewSet,
    basename='checkin'
)

urlpatterns = router.urls