from django.urls import path, re_path

from . import views

urlpatterns = [
    re_path('reduceDimensionAndCluster/', views.receive_files, name='file_receiver'),
    re_path('cluster/', views.cluster, name="cluster"),
    re_path('keggPathway/', views.pathway_finder, name="pathway_finder"),
    re_path('hello/', views.hello, name="hello"),
]
