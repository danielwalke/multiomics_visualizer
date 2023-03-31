def response_structure():
    """
    :return: Function returns the response structure
    """
    return {
        "targetFeatureConnection": [],
        "reducedDimensionData": {
            "target": "",
            "narrow_matrix": "",
            "features": "",
            "loadings_matrix": "",
            "variance_ratio": "",
            "featureCount": "",
        },
        "clusteredData": {
            "centroids": "",
            "labels": ""
        }
    }


class Response:
    def __init__(self):
        self.response = response_structure()

    def add(self, response_field_name, inner_details):
        """
        This method adds data into the corresponding position of response dictionary
        :param response_field_name: key of the field to be added in response. This is of heuristic type enum
        :param inner_details: dictionary to be appended to the key value (i.e response_field_name)
        :return: No return
        """
        response_to_append = self.response[response_field_name.value]
        for key in response_to_append:
            # if the key is found append the value else append empty string
            response_to_append[key] = inner_details[key] if response_to_append.get(key) is not None else ""

    def modify(self, response_field_name, inner_field_name, inner_field_content):
        """
        Modify the response dictionary
        :param response_field_name: key of the field in response
        :param inner_field_name: key of the field in response_field_name
        :param inner_field_content: value to be appended in inner_field_name
        :return: No return
        """
        self.response[response_field_name][inner_field_name] = inner_field_content

    def add_target_feature_connection(self, array):
        """
        to add target- ec or target - cpd connection
        :param array:
        :return:
        """
        self.response["targetFeatureConnection"].append(array)

    def get_response_body(self):
        return self.response
