console.log("HELLO: RECOMMENDED");

(function () {
  fetch("https://653b1d2d2e42fd0d54d4b448.mockapi.io/book/recommend")
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    })
    .catch((error) => console.error("Error fetching data:", error));

  const renderData = (data) => {
    const recommendElements = document.querySelector(
      ".recommend-system-wrap .recommend-list"
    );
    data.forEach((item) => {
      const recommendItem = `<div class="recommend-item">
        <img src="${item.image_url}" alt="" class="recommend-item-image" />
        <p class="recommend-item-author">${item.name}</p>
      </div>`;

      recommendElements.insertAdjacentHTML("beforeend", recommendItem);
    });

    // console.log("DATA", data);
    console.log(recommendElements);
  };
})();
