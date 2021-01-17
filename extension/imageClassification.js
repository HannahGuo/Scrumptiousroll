let foodModel = null;
/**
 * 
 * @param {HTMLImageElement} image
*/
let getFoodPredictionsForImage = async url => {
    const r = await fetch('http://localhost:5000/api/predict', {
        method: 'GET',
        body: JSON.stringify({ url })
    });
    const predictions = (await r.json()).map(p => ({ 
        ...p,
        className: p.className.slice(p.className.indexOf('\\') + 1).replace(/\_/g, ' ')
     }));
    return predictions; // [{ className: 'food name', probability: 0.5 }]
};