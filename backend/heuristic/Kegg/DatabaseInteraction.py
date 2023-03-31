from heuristic.models import Kegg, ECDetails, CPDDetails
from heuristic.Kegg.FetchKegg import get_keggdata
from heuristic.ClassCollection.KeggPathway import KeggPathway


def database_interaction(data_frame):
    if Kegg.objects.all().count() == 0 or ECDetails.objects.all().count() == 0 or CPDDetails.objects.all().count() == 0:
        get_keggdata()
    # else:
    total_entries_in_link = 0
    max_cpd_count = 0
    kegg_pathway = KeggPathway()
    (ec_number_collection, ec_number_set) = fetch_unique_ec_number(data_frame)
    kegg_pathway.add_collection(ec_number_collection)
    cpd_set = []
    for ec_number in ec_number_set:
        total_entries_in_link += 1
        if not ("-" in ec_number):
            # getting ec details from databse
            ec_details = ECDetails.objects.filter(ec_number__exact=ec_number).values("details")[0].get("details")
            kegg_pathway.add_ec_details(ec_number, ec_details)
            links = Kegg.objects.filter(ec_number__exact=ec_number).values("cpd")
            cpd = [entry.get("cpd") for entry in links]
            # get details of CPD
            for cpd_number in cpd:
                if not cpd_set.__contains__(cpd_number):
                    cpd_set.append(cpd_number)
                    cpd_details = CPDDetails.objects.filter(cpd_number__exact=cpd_number).values("details")[0].get("details")
                    kegg_pathway.add_cpd_details(cpd_number, cpd_details)
            total_entries_in_link += len(cpd)
            if len(cpd) > max_cpd_count:
                max_cpd_count = len(cpd)
            kegg_pathway.append_link(ec_number, cpd)
    kegg_pathway.add_total_entries(total_entries_in_link)
    kegg_pathway.add_max_cpd(max_cpd_count)
    return kegg_pathway.get_link_collection()


def fetch_unique_ec_number(data_frame):
    ec_number_collection = []
    ec_number_set = set()
    for index in range(len(data_frame)):
        data_array = data_frame.iloc[index, 0].split(";")
        collection = []
        for number in data_array:
            if (number != "") and not ("-" in number):
                ec_number_set.add(number)
                collection.append(number)
        ec_number_collection.append(collection)
    return ec_number_collection, ec_number_set
