
class KeggPathway:
    def __init__(self):
        self.kegg = {
            "links": [],
            "ec_number_collection": [],
            "total_entries": 0,
            "max_cpd_count": 0,
            "ec_number": [],
            "ec_details": [],
            "cpd_number": [],
            "cpd_details": []
        }

    def append_link(self, ec, cpd):
        link = {
            "ec": ec,
            "cpd": cpd
        }
        self.kegg["links"].append(link)

    def add_ec_details(self, ec_number, detail):
        self.kegg["ec_number"].append(ec_number)
        self.kegg["ec_details"].append(detail)

    def add_cpd_details(self, cpd_number, detail):
        self.kegg["cpd_number"].append(cpd_number)
        self.kegg["cpd_details"].append(detail)

    def add_collection(self, ec_number_collection):
        self.kegg["ec_number_collection"] = ec_number_collection

    def add_total_entries(self, count):
        self.kegg["total_entries"] = count

    def add_max_cpd(self, count):
        self.kegg["max_cpd_count"] = count

    def get_link_collection(self):
        return self.kegg