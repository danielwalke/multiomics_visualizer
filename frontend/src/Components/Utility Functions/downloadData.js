import XLSX from "xlsx"

export const downloadData = (data) => {
    let workBook = XLSX.utils.book_new();
    let content = [];
    data.reducedDimensionData.target.map((target, index) => {
        content.push({
            "Target": target,
            [`Component ${data.component1} (variance ratio ${data.reducedDimensionData.varianceRatio[data.component1 - 1]}%)`]: data.reducedDimensionData.narrowMatrix[index].x,
            [`Component ${data.component2} (variance ratio ${data.reducedDimensionData.varianceRatio[data.component2 - 1]}%)`]: data.reducedDimensionData.narrowMatrix[index].y,
            "Cluster": `${data.clusteredData.labels[index] + 1}`
        })
    })
    let workSheet = XLSX.utils.json_to_sheet(content);
    XLSX.utils.book_append_sheet(workBook, workSheet, "Score and Cluster Data");
    content = [];
    data.reducedDimensionData.features.map((feature, index) => {
        content.push({
            "Features": feature,
            [`Feature of component ${data.component1}`]: data.reducedDimensionData.loadingsMatrix[index][1].x,
            [`Feature of component ${data.component2}`]: data.reducedDimensionData.loadingsMatrix[index][1].y
        })
    })
    workSheet = XLSX.utils.json_to_sheet(content);
    XLSX.utils.book_append_sheet(workBook, workSheet, "Loadings Data");
    content = [];
    data.clusteredData.centroids.map((center, index) => {
        content.push({
            "Cluster": index + 1,
            "X-Coordinate of cluster centroid": center.x,
            "Y-Coordinate of cluster centroid": center.y
        })
    })
    workSheet = XLSX.utils.json_to_sheet(content);
    XLSX.utils.book_append_sheet(workBook, workSheet, "Cluster Centroid(s)");
    XLSX.writeFile(workBook, `${data.title}.xlsx`)
}