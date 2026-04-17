"""
URL configuration for audit_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
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
# audit_project/urls.py
from django.contrib import admin
from django.urls import path, include
from audits import views as audit_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('submit/', audit_views.submit_report, name='submit_report'),
    path('reports/', audit_views.view_reports, name='view_reports'),
    path('reports/<int:report_id>/', audit_views.delete_report, name='delete_report'),

    path('', audit_views.view_reports, name='home'),
]

