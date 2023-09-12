# Create your views here.
import pandas as pd
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view
from rest_framework.exceptions import ParseError, server_error

from heuristic.MachineLearning.Converter import convert_tolist, convert_tolist_1d
from heuristic.MachineLearning.HeuristicEnums import HeuristicType
from heuristic.MachineLearning.KMeans import compute_kmeans
from heuristic.MachineLearning.PCA import compute_pca
from heuristic.ClassCollection.MachineLearningResponse import Response

from heuristic.Kegg.DatabaseInteraction import database_interaction


@api_view(['POST'])
def receive_files(request):
    try:
        response = Response()
        cluster_size = int(request.data.get("clusterSize"))
        data_frame = pd.read_csv(request.data.get("dataset").file)
        clustering_type = request.data.get("clustering")
        # preprocessing
        data_frame = data_frame.fillna(0)
        # to get connections between ec or compounds with the target
        if request.data.get("fileType") != "Other Files":
            # since clustering will be specified in row two, it should be skipped
            row_start = 0 if clustering_type == "auto" else 1
            for index in range(1, data_frame.shape[1]):
                response.add_target_feature_connection(convert_tolist_1d(data_frame.iloc[row_start:, index]))
        # transpose the input file
        data_frame = data_frame.set_index(data_frame.columns[0]).T.rename_axis("Target/Features").reset_index()
        #
        column_list = [data_frame.columns[0]] if clustering_type == "auto" else [data_frame.columns[0],
                                                                                 data_frame.columns[1]]
        feature_matrix = data_frame.drop(column_list, 1)
        feature_matrix.dropna(how="all", axis=1)
        target = data_frame[data_frame.columns[0]]
        user_defined_labels = [] if clustering_type == "auto" else data_frame.iloc[:, 1]
        pca = compute_pca(feature_matrix, target)
        response.add(HeuristicType.dimensionalityReduction, pca)
        kmeans = compute_kmeans(pca.get("narrow_matrix")[0], pca.get("narrow_matrix")[1], cluster_size,
                                clustering_type == "auto", user_defined_labels)
        response.add(HeuristicType.clustering, kmeans)
        return JsonResponse(response.get_response_body())
    except Exception as e:
        raise ParseError({"file": request.data.get("fileName"), "details": e})


@api_view(['POST'])
def cluster(request):
    try:
        response = Response()
        component1 = request.data.get("component1")
        component2 = request.data.get("component2")
        cluster_size = int(request.data.get("clusterSize"))
        kmeans = compute_kmeans(component1, component2, cluster_size, True, [])
        response.add(HeuristicType.clustering, kmeans)
        return JsonResponse(response.get_response_body())
    except Exception as e:
        raise server_error(e)


@api_view(['POST'])
def pathway_finder(request):
    try:
        data_frame = pd.read_csv(request.data.get("data").file)
        links = database_interaction(data_frame)
        return JsonResponse(links)
    except Exception as e:
        raise ParseError({"file": request.data.get("data").name, "details": e})

@api_view(['GET'])
def hello(request):
    return HttpResponse("Hello, world!")