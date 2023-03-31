export const uploadedFileStateObject = (file) => {
    return {
        file: file,
        fileType: "Others",
        clustering: "auto",
        component1: 1,
        component2: 2,
        displayLoadings: "All",
    targetFeatureConnection: [],
        reducedDimensionData: "",
        clusteredData: {},
        selectedTarget: null,
    }
}

export const uploadedAdditionalFileStateObject = (file) => {
    return {
        file: file,
        fileType: "Additional File",
        kegg: {},
    }
}