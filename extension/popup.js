let foundFoodButton = document.getElementById('foodDetectedButton');

foundFoodButton.onclick = function (element) {
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
    alert(image);
    let newImg = `<img src="${image}">`
    document.getElementById("labelledImage").innerHTML = newImg;

    // Predict the food
    const imageElement = document.querySelector('#labelledImage > img');
    imageElement.onload = () => { // Tensorflow doesn't like not seeing a width and height attribute on the element, so we have to set it ourselves before classifying it.
      imageElement.setAttribute('width', imageElement.width);
      imageElement.setAttribute('height', imageElement.height);
      getFoodPredictionsForImage(imageElement).then(predictions => alert(JSON.stringify(predictions)));
    };

  });
};