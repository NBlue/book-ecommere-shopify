const handle_books = window.location.pathname.split("/").pop();
const count = 10;

(function () {
  fetch(
    `http://127.0.0.1:9001/get-recommend?type=collab-filter&count=${count}&handle=${handle_books}`
  )
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    })
    .catch((error) => console.error("Error fetching data:", error));

  const renderData = (res) => {
    const recommendElements = document.querySelector(
      ".recommend-system-wrap .recommends.collabs"
    );

    console.log("Filter data:", res);

    res.data.forEach((item) => {
      const recommendItem = `
      <div class="recommend-item">
        <img src="${item["Image Src"]}" alt="image" class="recommend-item-image" />
        <a href="/products/${item.handle}" class="recommend-item-name">${item["Title"]}</a>
        <p class="recommend-item-price">
          <span class="recommend-item-old-price">$${item["Variant Compare At Price"]}</span>
          $${item["Variant Price"]}
        </p>
      </div>`;

      recommendElements.insertAdjacentHTML("beforeend", recommendItem);
    });
  };
})();

(function () {
  fetch(`http://127.0.0.1:9001/get-recommend?type=popular&count=${count}`)
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    })
    .catch((error) => console.error("Error fetching data:", error));

  const renderData = (res) => {
    const recommendPopularElements = document.querySelector(
      ".recommend-system-wrap .recommends.populars"
    );

    console.log("Popular data:", res);

    res.data.forEach((item) => {
      const recommendItem = `
      <div class="recommend-item">
        <img src="${item["Image Src"]}" alt="image" class="recommend-item-image" />
        <a href="/products/${item.handle}" class="recommend-item-name">${item["Title"]}</a>
        <p class="recommend-item-price">
          <span class="recommend-item-old-price">$${item["Variant Compare At Price"]}</span>
          $${item["Variant Price"]}
        </p>
      </div>`;

      recommendPopularElements.insertAdjacentHTML("beforeend", recommendItem);
    });
  };
})();
