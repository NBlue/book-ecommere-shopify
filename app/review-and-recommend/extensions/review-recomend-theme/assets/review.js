const form = document.getElementById("add-review-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fileImage = form.querySelector("#image_url");
  console.log("FILE IMAGE", fileImage.files);

  const review = form.querySelector("#review");
  console.log("FILE REVIEWER", review.value);
});
