let foundFoodButton = document.getElementById('foodDetectedButton');
let showRecipesButton = document.getElementById('showRecipesButton');

function renderFood() {
  let foodList = document.getElementById("foodTable");
  foodList.innerHTML = "";

  let foodObjects = JSON.parse(localStorage.getItem("foodObjects") || "[]");

  foodObjects.forEach(function (foodItem, index) {
    let newFoodEntry = foodList.insertRow(0);
    let cellImage = newFoodEntry.insertCell(0);

    searchForRecipes(foodItem.name).then((recipes) => {
      let topRecipe = recipes[0];
      cellImage.innerHTML = `<img class="screenshot" src="${foodItem.src}"><br><br> <h3>${topRecipe.name}</h3>
      <strong>Recipe by:</strong> ${topRecipe.author}<br><br><a href="https:${topRecipe.link}" target="_blank"><div class="recipeButton">&#128073; Get Recipe! &#128072;</div></a>`;
      console.log(topRecipe.link.substring(2));
    });
  });
}

foundFoodButton.onclick = function (element) {
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
    let newFood = {
      src: image,
      name: "from modal"
    };

    let foodObjects = JSON.parse(localStorage.getItem("foodObjects") || "[]");
    foodObjects.push(newFood);
    localStorage.setItem("foodObjects", JSON.stringify(foodObjects));
    renderFood();

    alert("New food had been added!");

    // Predict the food
    const imageElement = document.querySelector('#labelledImage > img');
    imageElement.onload = () => { // Tensorflow doesn't like not seeing a width and height attribute on the element, so we have to set it ourselves before classifying it.
      imageElement.setAttribute('width', imageElement.width);
      imageElement.setAttribute('height', imageElement.height);
      getFoodPredictionsForImage(imageElement).then(predictions => alert(JSON.stringify(predictions)));
    };

  });
};

showRecipesButton.onclick = function (element) {
  if (showRecipesButton.value.includes("Show")) {
    document.getElementById("recipesDiv").style.display = "block";
    showRecipesButton.style.backgroundColor = "#990000";
    renderFood();
    showRecipesButton.value = "Hide recipes!";
  } else {
    showRecipesButton.value = "\uD83C\uDF5B Show me my recipes!";
    showRecipesButton.style.backgroundColor = "#004d1a";
    document.getElementById("recipesDiv").style.display = "none";
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    (function () {
      var ln = links[i];
      var location = ln.href;
      ln.onclick = function () {
        chrome.tabs.create({
          active: true,
          url: location
        });
      };
    })();
  }
});