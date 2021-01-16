let foundFoodButton = document.getElementById('foodDetectedButton');

foundFoodButton.onclick = function (element) {
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
    alert(image);
    let newImg = `<img src="${image}">`
    document.getElementById("labelledImage").innerHTML = newImg;
  });
};