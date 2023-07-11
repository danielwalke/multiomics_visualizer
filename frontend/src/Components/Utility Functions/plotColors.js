const colorsToBeAvoided = ["#D8BFD8", "#E6E6FA","#E0FFFF", "#F5F5F5", "#DCDCDC", "#D3D3D3", "#C0C0C0", "#A9A9A9",
    "#696969", "#808080", "#708090"]

const maximumColorCodeAvailable = 16777215;

export const generateColors = (numberOfColors) => {
    let hslaCode = [];
    let intervalBetweenColors = Math.trunc(360/numberOfColors), saturation = "100", lightness = "40", alpha = "1"
    for(let iteration = 0; iteration < numberOfColors; iteration++){
        let hue = iteration * intervalBetweenColors;
        hslaCode.push(`hsla(${hue},${saturation}%,${lightness}%,${alpha})`)
    }
    return hslaCode;
    /*
    * For generating hex code for colors
    * */
}

export const scorePlotColor = "#000"

export const loadingPlotColor = "#21908d";
