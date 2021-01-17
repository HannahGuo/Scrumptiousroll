let foodModel = null;

// TODO: Load our food model when complete
mobilenet.load().then(model => {
    foodModel = model;
});

/**
 * @typedef Prediction
 * @property {string} className Prediction name
 * @property {number} probability a decimal from 0-1 on how accurate the model thinks it is this 
 */

/**
 * 
 * @param {HTMLImageElement} image 
 * @returns {Prediction[]}
 */
let getFoodPredictionsForImage = async image => {
    if (!foodModel) {
        foodModel = await mobilenet.load(); // TODO: Load our food model when complete
    }
    const predictions = await foodModel.classify(image);
    return predictions;
};