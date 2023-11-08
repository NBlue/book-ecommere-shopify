var pElements = document.querySelectorAll(
  ".page-width.scroll-trigger.animate--slide-in > p"
);
for (var i = 0; i < pElements.length; i++) {
  pElements[i].style.display = "none";
}

(function () {
  fetch("https://653b1d2d2e42fd0d54d4b448.mockapi.io/book/recommend")
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    })
    .catch((error) => console.error("Error fetching data:", error));

  const renderData = (data) => {
    const recommendElements = document.querySelector(
      ".recommend-system-wrap .recommends"
    );

    data.forEach((item) => {
      const recommendItem = `<div class="recommend-item">
        <img src="${item.image_url}" alt="image" class="recommend-item-image" />
        <a href="/products/the-adventures-of-drew-and-ellie-the-magical-dress" class="recommend-item-name">${item.name}</a>
        <p class="recommend-item-price">
          <span class="recommend-item-old-price">$119.00 USD</span>
          $99.00 USD
        </p>
      </div>`;

      recommendElements.insertAdjacentHTML("beforeend", recommendItem);
    });
  };
})();
