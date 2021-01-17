let foundFoodButton = document.getElementById('foodDetectedButton');

function renderFood() {
  let foodList = document.getElementById("labelledImage");
  while (foodList.hasChildNodes()) {
    foodList.removeChild(foodList.firstChild);
  }

  let foodObjects = JSON.parse(localStorage.getItem("foodObjects") || "[]");

  foodObjects.forEach(function (foodItem, index) {
    let screenshot = document.createElement("img");
    screenshot.setAttribute("id", "screenshot");
    screenshot.src = foodItem.src;
    document.getElementById("labelledImage").appendChild(screenshot);
  });
}

foundFoodButton.onclick = function (element) {
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
    let newFood = {
      src: image,
      recipes: "filler"
    };

    let foodObjects = JSON.parse(localStorage.getItem("foodObjects") || "[]");
    foodObjects.push(newFood);
    localStorage.setItem("foodObjects", JSON.stringify(foodObjects));
    renderFood();

    // Predict the food
    const imageElement = document.querySelector('#labelledImage > img');
    imageElement.onload = () => { // Tensorflow doesn't like not seeing a width and height attribute on the element, so we have to set it ourselves before classifying it.
      imageElement.setAttribute('width', imageElement.width);
      imageElement.setAttribute('height', imageElement.height);
      getFoodPredictionsForImage(imageElement).then(predictions => alert(JSON.stringify(predictions)));
    };

  });
};

(function() {
  // your page initialization code here
  // the DOM will be available here
  renderFood();
})();