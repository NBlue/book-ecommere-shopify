const handle_books = window.location.pathname.split("/").pop();
const count = 10;
console.log("Zo day...1");

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

const recommendCfElements = document.querySelector(
  ".recommend-system-wrap .recommends.cf-user"
);
const email = recommendCfElements.getAttribute("email");

(function () {
  fetch(
    `http://localhost:9001/get-recommend?type=cf-user&count=${count}&email=${email}`
  )
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    })
    .catch((error) => console.error("Error fetching data:", error));

  const renderData = (res) => {
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

      recommendCfElements.insertAdjacentHTML("beforeend", recommendItem);
    });
  };
})();

const form = document.getElementById("add-review-form");
const handle = window.location.pathname.split("/").pop();
const customerElement = document.querySelector(".avatar-wrap-review .text");
const userId = customerElement.getAttribute("customer_id");
// const email = customerElement.textContent;

const ratingListElement = form.querySelector(".form-control .rating-list");
console.log({ ratingListElement });
console.log("Zo day...");

let rating = 0;

// Handle Modify Rating
const renderRatingForm = () => {
  console.log("Render rating...");
  ratingListElement.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    let ratingItem = null;
    if (i <= rating)
      ratingItem = `<ion-icon name="star" onclick="handleClickRating(${i})"></ion-icon>`;
    else
      ratingItem = `<ion-icon name="star-outline" onclick="handleClickRating(${i})"></ion-icon>`;
    ratingListElement.insertAdjacentHTML("beforeend", ratingItem);
  }
};
renderRatingForm();

// Handle click rating
const handleClickRating = (i) => {
  console.log(i);
  rating = i;
  renderRatingForm();
};

// Handle submit
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fileImage = form.querySelector("#image_url");
  const review = form.querySelector("#review");

  if (rating === 0 || review.value === "")
    alert("Please rate stars and enter product reviews before submitting!");
  else {
    const formData = new FormData();
    if (fileImage.files[0]) formData.append("image_url", fileImage.files[0]);
    formData.append("email", email);
    formData.append("userId", userId);
    formData.append("rating", rating);
    formData.append("comment", review.value.trim());
    formData.append("handle", handle);

    fetch("http://localhost:9000/v1/review", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});

const handleDeleteReview = (id) => {
  fetch(`http://localhost:9000/v1/review/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

// Render reviews for book
(function () {
  fetch(`http://localhost:9000/v1/review/${handle}`)
    .then((response) => response.json())
    .then((data) => {
      renderData(data.data);
    })
    .catch((error) => console.error("Error fetching data:", error));

  const renderData = (data) => {
    const reviewList = document.querySelector(".reviews-list");

    const renderRating = (rating) => {
      let ratingString = "";
      for (let i = 1; i <= rating; i++) {
        ratingString += `<ion-icon name="star"></ion-icon>`;
      }
      for (let i = 1; i <= 5 - rating; i++) {
        ratingString += `<ion-icon name="star-outline"></ion-icon>`;
      }
      return ratingString;
    };

    data.forEach((item) => {
      const review = `<div class="reviews-item">
      ${
        item.image_url
          ? `<img src="${item.image_url}" alt="" class="image"></img>`
          : ""
      }
      <div class="ratings">
        ${renderRating(item.rating)}
      </div>
      <div class="review">
        ${item.comment}
      </div>
      <div class="footer-wrap">
        <span class="date">${item.updatedAt}</span>
        <div class="btn">
          <button class="edit-btn">Edit</button>
          <button class="removed-btn" onclick="handleDeleteReview(${
            item.id
          })">Delete</button>
        </div>
      </div>
    </div>`;

      reviewList.insertAdjacentHTML("beforeend", review);
    });
  };
})();
