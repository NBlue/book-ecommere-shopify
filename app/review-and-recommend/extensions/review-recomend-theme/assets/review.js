const form = document.getElementById("add-review-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fileImage = form.querySelector("#image_url");
  console.log("FILE IMAGE", fileImage.files);

  const review = form.querySelector("#review");
  console.log("FILE REVIEWER", review.value);

  const formData = new FormData();
  formData.append("image_url", fileImage.files[0]); // Chỉ lấy tệp tin đầu tiên
  formData.append("review", review.value);
  console.log("form data", formData);

  fetch("http://localhost:9000/v1/review", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json()) // Chuyển đổi phản hồi thành JSON
    .then((data) => {
      // Xử lý dữ liệu từ API backend (nếu cần)
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
