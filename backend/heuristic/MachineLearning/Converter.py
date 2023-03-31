precision_floating = 4


def convert_tolist(numpy_array):
    """
    This converts numpy 2D - array to a normal array since JSONResponse doesn't support serialization of
    numpy arrays
    :param numpy_array: Numpy array to be converted
    :return: Normal python array
    """
    flattened_array = {};
    for index, array in enumerate(numpy_array):
        flattened_array[index] = list(map(lambda num: round(num, precision_floating), array))
    return flattened_array;


def convert_tolist_1d(numpy_array):
    """
    This converts numpy 1D - array to a normal array since JSONResponse doesn't support serialization of
    numpy arrays
    :param numpy_array:
    :return:
    """
    flattened_array = []
    for value in numpy_array:
        flattened_array.append(round(float(value), precision_floating))
    return flattened_array
