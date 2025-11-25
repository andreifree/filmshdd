// ============================================
// PRODUCT PAGE QUANTITY CONTROL
// ============================================

function initProductPage(productData) {
  document.addEventListener("DOMContentLoaded", function () {
    loadCartFromLocalStorage();

    const buyBtn = document.getElementById("buyBtn");
    const quantityControl = document.getElementById("quantityControl");
    const decreaseBtn = quantityControl.querySelector(".qty-decrease");
    const increaseBtn = quantityControl.querySelector(".qty-increase");
    const quantityValue = quantityControl.querySelector(".product-qty-value");

    // Check if product is already in cart
    const cartItem = cart.find((item) => item.id === productData.id);
    if (cartItem) {
      buyBtn.classList.add("hidden");
      quantityControl.classList.add("active");
      quantityValue.textContent = cartItem.quantity;
    }

    // Buy button click
    buyBtn.addEventListener("click", function () {
      addToCart(productData);
      buyBtn.classList.add("hidden");
      quantityControl.classList.add("active");
      updateQuantity();
    });

    // Increase quantity
    increaseBtn.addEventListener("click", function () {
      increaseQuantity(productData.id);
      updateQuantity();
    });

    // Decrease quantity
    decreaseBtn.addEventListener("click", function () {
      decreaseQuantity(productData.id);
      updateQuantity();

      // Check if item was removed
      const item = cart.find((i) => i.id === productData.id);
      if (!item) {
        buyBtn.classList.remove("hidden");
        quantityControl.classList.remove("active");
      }
    });

    function updateQuantity() {
      const item = cart.find((i) => i.id === productData.id);
      if (item) {
        quantityValue.textContent = item.quantity;
      }
    }
  });
}

function goBack() {
  window.location.href = "index.html";
}
