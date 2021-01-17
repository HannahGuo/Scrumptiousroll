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
      <strong>Recipe by:</strong> ${topRecipe.author}<br><strong>Time Needed: </strong>${topRecipe.estimatedTime}<br><strong>Difficulty Level: </strong>${topRecipe.difficulty}<br><br><a href="${topRecipe.link}" target="_blank"><div class="recipeButton">&#128073; Get Recipe! &#128072;</div></a>`;
    });
  });
}

foundFoodButton.onclick = function (element) {
  chrome.tabs.captureVisibleTab(null, {}, async function (image) {

    // Predict the food
    getFoodPredictionsForImage(image).then(predictions => {
      const highestPrediction = predictions[0];

      if (highestPrediction.probability < 0.25) {
        // TODO: MMS COME BACKKKK, WHAT HAPPENS IF IT DOESN'T PREDICT ANYTHING
        return;
      }

      searchForRecipes(highestPrediction.className).then(recipes => {
        let topRecipe = recipes[0];

        let foodObjects = JSON.parse(localStorage.getItem("foodObjects") || "[]");
        foodObjects.push(topRecipe);
        localStorage.setItem("foodObjects", JSON.stringify(foodObjects));
        renderFood();

        let divOverlay = document.getElementById("divOverlay");
        divOverlay.style.display = "block";
  
        if (topRecipe.image) {
          divOverlay.innerHTML = `<h2>You found a recipe for ${topRecipe.name}!</h2><br><img class="smolImg" src="${image}"><br><img class="smolImg" src="${topRecipe.image}"><br><strong>Recipe by: </strong>${topRecipe.author}<br><strong>Time Needed: </strong>${topRecipe.estimatedTime}<br><strong>Difficulty Level: </strong>${topRecipe.difficulty}<br><br><a href="${topRecipe.link}" target="_blank"><div class="recipeButton popupButton">&#128073; Get Recipe! &#128072;</div></a><br><input type="button" class="popupButton" id="closeButton" value="&#10060; Close"></input>`
        } else {
          divOverlay.innerHTML = `<h2>You found a recipe for ${topRecipe.name}!</h2><br><img class="smolImg" src="${image}"><br><strong>Recipe by: </strong>${topRecipe.author}<br><strong>Time Needed: </strong>${topRecipe.estimatedTime}<br><strong>Difficulty Level: </strong>${topRecipe.difficulty}<br><br><a href="${topRecipe.link}" target="_blank"><div class="recipeButton popupButton">&#128073; Get Recipe! &#128072;</div></a><br><input type="button" class="popupButton" id="closeButton" value="&#10060; Close"></input>`
        }
  
        document.getElementById("closeButton").onclick = function (element) {
          document.getElementById("divOverlay").style.display = "none";
        };

      });


    });
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