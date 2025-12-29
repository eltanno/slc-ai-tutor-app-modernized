"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

import posixpath
from pathlib import Path

from api.views import CreateUserView, TokenObtainPairView
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.utils._os import safe_join
from django.views.static import serve as static_serve
from rest_framework_simplejwt.views import TokenRefreshView


def serve_react(request, path, document_root=None):
    path = posixpath.normpath(path).lstrip('/')
    fullpath = Path(safe_join(document_root, path))
    if fullpath.is_file():
        return static_serve(request, path, document_root)
    return static_serve(request, 'index.html', document_root)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', CreateUserView.as_view(), name='user_register'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include('api.urls')),
    re_path(
        r'^(?P<path>.*)$', serve_react, {'document_root': settings.FRONTEND_BUILD_DIR}
    ),
]
