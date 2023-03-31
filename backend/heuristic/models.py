from django.db import models


# Create your models here.
class Kegg(models.Model):
    ec_number = models.CharField(max_length=20)
    cpd = models.CharField(max_length=20)


class ECDetails(models.Model):
    ec_number = models.CharField(max_length=20)
    details = models.TextField()


class CPDDetails(models.Model):
    cpd_number = models.CharField(max_length=20)
    details = models.TextField()
