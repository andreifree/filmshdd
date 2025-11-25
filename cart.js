// ============================================
// CART SYSTEM - MODULAR IMPLEMENTATION
// ============================================

// Cart State
let cart = [];

// ============================================
// CART CORE FUNCTIONS
// ============================================

function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCartToLocalStorage();
  updateCartUI();
  showCartTooltip();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCartToLocalStorage();
  updateCartUI();
}

function increaseQuantity(productId) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += 1;
    saveCartToLocalStorage();
    updateCartUI();
  }
}

function decreaseQuantity(productId) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      removeFromCart(productId);
      return;
    }
    saveCartToLocalStorage();
    updateCartUI();
  }
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getTotalQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveCartToLocalStorage() {
  localStorage.setItem("filmshdd_cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const stored = localStorage.getItem("filmshdd_cart");
  if (stored) {
    try {
      cart = JSON.parse(stored);
      updateCartUI();
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      cart = [];
    }
  }
}

function clearCart() {
  cart = [];
  saveCartToLocalStorage();
  updateCartUI();
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updateCartUI() {
  updateCartBadge();
  updateCartModal();
  updateCartTooltip();
  updateCartIconVisibility();
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) {
    const totalQty = getTotalQuantity();
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? "flex" : "none";
  }
}

function updateCartIconVisibility() {
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    const totalQty = getTotalQuantity();
    if (totalQty > 0) {
      cartIcon.classList.add("has-items");
    } else {
      cartIcon.classList.remove("has-items");
    }
  }
}

function updateCartTooltip() {
  const tooltip = document.getElementById("cartTooltip");
  const tooltipContent = tooltip?.querySelector(".cart-tooltip-content");

  if (tooltipContent) {
    const total = calculateTotal();
    const qty = getTotalQuantity();

    if (qty === 0) {
      tooltipContent.textContent = "Корзина пуста";
    } else {
      tooltipContent.innerHTML = `
        <div><strong>${qty}</strong> ${getItemWord(qty)}</div>
        <div><strong>${total.toLocaleString("ru-RU")} ₽</strong></div>
      `;
    }
  }
}

function showCartTooltip() {
  const tooltip = document.getElementById("cartTooltip");
  if (tooltip) {
    tooltip.classList.add("show");
    setTimeout(() => {
      tooltip.classList.remove("show");
    }, 2000);
  }
}

function getItemWord(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "товаров";
  }
  if (lastDigit === 1) {
    return "товар";
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return "товара";
  }
  return "товаров";
}

function updateCartModal() {
  const cartEmpty = document.getElementById("cartEmpty");
  const cartItems = document.getElementById("cartItems");
  const cartFooter = document.getElementById("cartFooter");
  const cartTotalPrice = document.getElementById("cartTotalPrice");

  if (!cartItems) return;

  if (cart.length === 0) {
    cartEmpty.style.display = "block";
    cartItems.style.display = "none";
    cartFooter.style.display = "none";
  } else {
    cartEmpty.style.display = "none";
    cartItems.style.display = "block";
    cartFooter.style.display = "block";

    cartItems.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image" />
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-controls">
          <div class="cart-item-quantity">
            <button class="qty-btn qty-decrease" onclick="decreaseQuantity('${
              item.id
            }')">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn qty-increase" onclick="increaseQuantity('${
              item.id
            }')">+</button>
          </div>
          <div class="cart-item-subtotal">
            ${(item.price * item.quantity).toLocaleString("ru-RU")} ₽
          </div>
        </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${
          item.id
        }')" title="Удалить">×</button>
      </div>
    `
      )
      .join("");

    if (cartTotalPrice) {
      cartTotalPrice.textContent = `${calculateTotal().toLocaleString(
        "ru-RU"
      )} ₽`;
    }
  }
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openCartModal() {
  const modal = document.getElementById("cartModal");
  const modalBody = document.getElementById("cartModalBody");
  const successScreen = document.getElementById("cartSuccess");

  if (modal) {
    // Reset to cart view
    modalBody.style.display = "block";
    successScreen.style.display = "none";

    // Reset form
    const form = document.getElementById("cartCheckoutForm");
    if (form) form.reset();

    updateCartModal();
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeCartModal() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Make closeCartModal globally accessible
window.closeCartModal = closeCartModal;

// ============================================
// CHECKOUT FUNCTIONS
// ============================================

async function handleCartCheckout(event) {
  event.preventDefault();

  const name = document.getElementById("cartCustomerName").value.trim();
  const contact = document.getElementById("cartCustomerContact").value.trim();
  const address = document.getElementById("cartCustomerAddress").value.trim();

  if (!name || !contact || !address) {
    alert("Пожалуйста, заполните все поля");
    return;
  }

  if (cart.length === 0) {
    alert("Корзина пуста");
    return;
  }

  const submitBtn = event.target.querySelector(".cart-checkout-btn");
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  const order = {
    orderId: generateOrderId(),
    items: cart.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
    })),
    totalPrice: calculateTotal(),
    customer: {
      name: name,
      contact: contact,
      address: address,
    },
    createdAt: new Date().toISOString(),
  };

  try {
    await createOrder(order);
    showOrderSuccess(order);
  } catch (error) {
    console.error("Order failed:", error);
    alert("Произошла ошибка при оформлении заказа. Попробуйте еще раз.");
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
}

async function createOrder(orderData) {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Order created:", orderData);

      // Save to localStorage for demo
      const orders = JSON.parse(
        localStorage.getItem("filmshdd_orders") || "[]"
      );
      orders.push(orderData);
      localStorage.setItem("filmshdd_orders", JSON.stringify(orders));

      resolve({ success: true, orderId: orderData.orderId });

      // In production:
      /*
      fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
      */
    }, 1500);
  });
}

function showOrderSuccess(order) {
  const modalBody = document.getElementById("cartModalBody");
  const successScreen = document.getElementById("cartSuccess");
  const successOrderId = document.getElementById("successCartOrderId");
  const successTotal = document.getElementById("successCartTotal");

  if (successOrderId) successOrderId.textContent = order.orderId;
  if (successTotal)
    successTotal.textContent = `${order.totalPrice.toLocaleString("ru-RU")} ₽`;

  modalBody.style.display = "none";
  successScreen.style.display = "block";

  clearCart();
}

function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// ============================================
// EVENT INITIALIZATION
// ============================================

function initCartSystem() {
  // Load cart from localStorage
  loadCartFromLocalStorage();

  // Buy button handlers
  const buyButtons = document.querySelectorAll(".btn-buy");
  buyButtons.forEach((button) => {
    button.addEventListener("click", handleBuyButtonClick);
  });

  // Cart icon handler
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    cartIcon.addEventListener("click", openCartModal);
  }

  // Modal close handlers
  const closeBtn = document.querySelector(".cart-modal-close");
  const overlay = document.querySelector(".cart-modal-overlay");

  if (closeBtn) closeBtn.addEventListener("click", closeCartModal);
  if (overlay) overlay.addEventListener("click", closeCartModal);

  // Checkout form handler
  const checkoutForm = document.getElementById("cartCheckoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCartCheckout);
  }
}

function handleBuyButtonClick(event) {
  const productCard = event.target.closest(".product-card");
  if (!productCard) return;

  const product = {
    id: productCard.dataset.collectionId,
    title: productCard.dataset.collectionTitle,
    price: parseInt(productCard.dataset.collectionPrice),
    image: productCard.dataset.collectionImage,
  };

  addToCart(product);
}

// Make functions globally accessible
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCartSystem);
} else {
  initCartSystem();
}
