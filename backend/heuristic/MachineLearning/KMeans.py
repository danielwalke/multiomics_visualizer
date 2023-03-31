from sklearn.cluster import KMeans
import numpy as np

from heuristic.MachineLearning.Converter import convert_tolist


def compute_kmeans(component1, component2, cluster_size, auto_clustering, user_defined_labels):
    """
    compute kmeans for given components in reduced dimensions
    :param auto_clustering: if user specified clustering is on or off
    :param user_defined_labels: labels user has specified
    :param component1: x-axis in reduced dimension
    :param component2: y-axis in reduced dimension
    :param cluster_size: number of clusters
    :return: cluster centroids and label
    """
    kmeans = KMeans(n_clusters=cluster_size if (cluster_size < len(component1)) else len(component1))
    if auto_clustering:
        data = convert_to_coordinate_system(component1, component2)
        kmeans.fit(data)
    return {
        "centroids": convert_tolist(kmeans.cluster_centers_) if auto_clustering else [],
        # return kmeans clustering if auto clustering is specified else return the user specified labels
        "labels": kmeans.labels_.tolist() if auto_clustering else list(user_defined_labels.values)
    }


def convert_to_coordinate_system(component1, component2):
    """
    convert the component1 and component2 array into coordinates
    :param component1: x-axis in reduced dimension
    :param component2: y-axis in reduced dimension
    :return: coordinates as Numpy array
    """
    coordinate_array = [];
    for (index, value) in enumerate(component1):
        coordinate_array.append([value, component2[index]]);
    return np.array(coordinate_array);
