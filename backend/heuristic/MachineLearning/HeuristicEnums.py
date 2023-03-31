from enum import Enum


class HeuristicType(Enum):
    """
    The value of this class attributes are linked to the response key.
    """
    dimensionalityReduction = "reducedDimensionData"
    clustering = "clusteredData"
