from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import IdeaViewSet, PublicTrackView, StatsView, UserManagementViewSet

router = DefaultRouter()
router.register(r'ideas', IdeaViewSet)
router.register(r'users', UserManagementViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('track/<str:ref_id>/', PublicTrackView.as_view(), name='track-idea'),
    path('stats/', StatsView.as_view(), name='api-stats'),
    
    # JWT Auth
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]