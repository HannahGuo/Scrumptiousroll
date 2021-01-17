let foodModel = null;
/**
 * 
 * @param {HTMLImageElement} image
 */
let getFoodPredictionsForImage = async image => {
    const base64 = image.src;
    const response = await fetch('localhost:8000/predict');
    const predictions = await response.json();
    return predictions;
};