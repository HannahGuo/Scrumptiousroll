let foodModel = null;
/**
 * 
 * @param {HTMLImageElement} image
*/
let getFoodPredictionsForImage = async url => {
    const r = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: JSON.stringify({ url })
    });
    const predictions = await r.json();
    return predictions; // [{ className: 'food name', probability: 0.5 }]
};