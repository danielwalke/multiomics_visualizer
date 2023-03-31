from sklearn import decomposition
from sklearn.preprocessing import StandardScaler

import pandas as pd

from heuristic.MachineLearning.Converter import convert_tolist

dimension_size = 50;


def compute_pca(feature_matrix, target):
    """
    Compute PCA on the given feature matrix
    :param feature_matrix: features of the uploaded CSV
    :param target: Target variable in the uploaded CSV
    :return: Target name (vector), narrow Matrix, feature name (vector), loading matrix, variance ratio
    """
    # following three steps are to standardise the features
    standardise = StandardScaler();
    standardise.fit(feature_matrix);
    scaled_data = standardise.transform(feature_matrix)
    # scaled_data = feature_matrix;
    # PCA
    pca = decomposition.PCA(n_components=dimension_size if(dimension_size < min(feature_matrix.shape[0], feature_matrix.shape[1])) else min(feature_matrix.shape[0], feature_matrix.shape[1]));
    reduced_dimensionality_matrix = convert_tolist(pca.fit_transform(scaled_data).T);
    loading_matrix = convert_tolist(pca.components_)
    variance_ratio = list(map(lambda num: round(num*100, 2), pca.explained_variance_ratio_));
    return {
        "target": list(map(lambda targetString: targetString.strip(), target)),
        "narrow_matrix": reduced_dimensionality_matrix,  # reduced_dimensionality_matrix
        "features": list(map(lambda featureString: featureString.strip(), feature_matrix.columns)),
        "loadings_matrix": loading_matrix,
        "variance_ratio": variance_ratio,
        "featureCount": feature_matrix.columns.shape[0]
    }
