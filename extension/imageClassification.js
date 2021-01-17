let foodModel = null;
/**
 * 
 * @param {HTMLImageElement} image
*/
let getFoodPredictionsForImage = async url => {
    const r = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },    
        body: JSON.stringify({ url })
    });
    const predictions = (await r.json());
    
    const items = [];
    for (const key in predictions) {
        const k = key.slice(key.indexOf('\\') + 1).replace(/\_/g, ' ');
        const value = predictions[key];
        items.push({
            className: k,
            prediction: value
        });
    }
    return items.sort((b, a) => b.prediction - a.prediction).reverse(); // [{ className: 'food name', probability: 0.5 }]

};