from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from game.views.settings.getinfo import InfoView
from game.views.settings.rank_list import RankListView
from game.views.settings.register import RegisterView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='settings_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='settings_token_refresh'),
    path("getinfo/", InfoView.as_view(), name="settings_getinfo"),
    path('ranklist/', RankListView.as_view(), name="settings_ranklist"),
    path("register/", RegisterView.as_view(), name="settings_register")
]
