from heuristic.models import Kegg, ECDetails, CPDDetails
import xlrd

import pandas as pd
import os


def get_keggdata():
    if Kegg.objects.all().count() == 0:
        data_frame = pd.read_csv(os.path.join(os.path.dirname(__file__), 'Kegg.csv'))
        for index in range(len(data_frame)):
            kegg_instance = Kegg.objects.create(ec_number=data_frame.loc[index, "EC"], cpd=data_frame.loc[index, "CPD"])
            kegg_instance.save()
    if ECDetails.objects.all().count() == 0:
        data_frame = pd.read_excel(os.path.join(os.path.dirname(__file__), 'EC details.xlsx'))
        for index in range(len(data_frame)):
            ec_instance = ECDetails.objects.create(ec_number=data_frame.loc[index, "EC"], details=data_frame.loc[index, "DETAILS"])
            ec_instance.save()
    if CPDDetails.objects.all().count() == 0:
        data_frame = pd.read_excel(os.path.join(os.path.dirname(__file__), 'Compound Details.xlsx'))
        for index in range(len(data_frame)):
            ec_instance = CPDDetails.objects.create(cpd_number=data_frame.loc[index, "CPD"], details=data_frame.loc[index, "DETAILS"])
            ec_instance.save()


