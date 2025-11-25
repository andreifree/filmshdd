// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Smooth Scroll Functionality
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#" || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80; // Adjust for fixed header height
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (burgerMenu && mobileMenu) {
          burgerMenu.classList.remove("open");
          mobileMenu.classList.remove("open");
        }
      }
    });
  });

  // Burger Menu Toggle
  const burgerMenu = document.getElementById("burgerMenu");
  const mobileMenu = document.getElementById("mobileMenu");

  if (burgerMenu && mobileMenu) {
    // Toggle menu
    burgerMenu.addEventListener("click", (e) => {
      e.stopPropagation();

      burgerMenu.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });

    // Close menu when clicking on a link
    const mobileLinks = document.querySelectorAll(".mobile-nav a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        burgerMenu.classList.remove("open");
        mobileMenu.classList.remove("open");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        burgerMenu.classList.contains("open") &&
        !mobileMenu.contains(e.target) &&
        !burgerMenu.contains(e.target)
      ) {
        burgerMenu.classList.remove("open");
        mobileMenu.classList.remove("open");
      }
    });
  }

  // Product list button functionality
  const listButtons = document.querySelectorAll(".btn-list");
  listButtons.forEach((button) => {
    button.addEventListener("click", function () {
      window.location.href = "sellingPage.html";
    });
  });

  // Product buy button functionality
  initCheckoutSystem();
});

// ============================================
// CHECKOUT SYSTEM
// ============================================

let currentOrder = null;

function initCheckoutSystem() {
  const buyButtons = document.querySelectorAll(".btn-buy");
  buyButtons.forEach((button) => {
    button.addEventListener("click", handleBuyClick);
  });

  // Close modal events
  const closeBtn = document.querySelector(".checkout-modal-close");
  const overlay = document.querySelector(".checkout-modal-overlay");

  if (closeBtn) closeBtn.addEventListener("click", closeCheckoutModal);
  if (overlay) overlay.addEventListener("click", closeCheckoutModal);

  // Form submission
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  }

  // Phone input formatting
  const phoneInput = document.getElementById("checkoutPhone");
  if (phoneInput) {
    phoneInput.addEventListener("input", formatPhoneInput);
  }
}

function handleBuyClick(event) {
  const productCard = event.target.closest(".product-card");

  if (!productCard) return;

  const collectionData = {
    id: productCard.dataset.collectionId,
    title: productCard.dataset.collectionTitle,
    price: parseInt(productCard.dataset.collectionPrice),
    description: productCard.dataset.collectionDescription,
  };

  openCheckoutModal(collectionData);
}

function openCheckoutModal(collectionData) {
  const modal = document.getElementById("checkoutModal");
  const step1 = document.getElementById("checkoutStep1");
  const successStep = document.getElementById("checkoutSuccess");

  // Reset modal state
  step1.style.display = "block";
  successStep.style.display = "none";

  // Populate product info
  document.getElementById("checkoutProductTitle").textContent =
    collectionData.title;
  document.getElementById("checkoutProductDescription").textContent =
    collectionData.description;
  document.getElementById(
    "checkoutProductPrice"
  ).textContent = `${collectionData.price.toLocaleString("ru-RU")} ₽`;
  document.getElementById(
    "checkoutTotalPrice"
  ).textContent = `${collectionData.price.toLocaleString("ru-RU")} ₽`;

  // Store current collection data
  currentOrder = collectionData;

  // Clear form
  document.getElementById("checkoutForm").reset();
  clearErrors();

  // Show modal
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
  currentOrder = null;
}

// Make closeCheckoutModal globally accessible
window.closeCheckoutModal = closeCheckoutModal;

async function handleCheckoutSubmit(event) {
  event.preventDefault();

  // Clear previous errors
  clearErrors();

  // Get form data
  const name = document.getElementById("checkoutName").value.trim();
  const phone = document.getElementById("checkoutPhone").value.trim();
  const address = document.getElementById("checkoutAddress").value.trim();
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  ).value;

  // Validate form
  let isValid = true;

  if (name.length < 2) {
    showError("nameError", "Введите корректное имя");
    isValid = false;
  }

  if (!validatePhone(phone)) {
    showError("phoneError", "Введите корректный номер телефона");
    isValid = false;
  }

  if (address.length < 10) {
    showError("addressError", "Введите полный адрес доставки");
    isValid = false;
  }

  if (!isValid) return;

  // Show loading state
  const submitBtn = event.target.querySelector(".checkout-submit-btn");
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  // Create order object
  const order = {
    orderId: generateOrderId(),
    collectionId: currentOrder.id,
    collectionTitle: currentOrder.title,
    price: currentOrder.price,
    user: {
      name: name,
      phone: phone,
      address: address,
    },
    paymentMethod: paymentMethod,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    // Send order to backend
    const result = await createOrder(order);

    // Show success screen
    showSuccessScreen(order);
  } catch (error) {
    console.error("Order creation failed:", error);
    alert(
      "Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону."
    );
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
}

async function createOrder(orderData) {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful order creation
      console.log("Order created:", orderData);

      // Store order in localStorage for demo purposes
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      orders.push(orderData);
      localStorage.setItem("orders", JSON.stringify(orders));

      resolve({ success: true, orderId: orderData.orderId });

      // In production, replace with:
      /*
      fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
      */
    }, 1500); // Simulate network delay
  });
}

function showSuccessScreen(order) {
  const step1 = document.getElementById("checkoutStep1");
  const successStep = document.getElementById("checkoutSuccess");

  // Populate success screen
  document.getElementById("successOrderId").textContent = order.orderId;
  document.getElementById("successProductTitle").textContent =
    order.collectionTitle;
  document.getElementById(
    "successPrice"
  ).textContent = `${order.price.toLocaleString("ru-RU")} ₽`;
  document.getElementById("successPaymentMethod").textContent =
    getPaymentMethodName(order.paymentMethod);

  // Switch to success screen
  step1.style.display = "none";
  successStep.style.display = "block";

  // Send confirmation email (mock)
  sendOrderConfirmation(order);
}

function sendOrderConfirmation(order) {
  // Mock email/SMS sending
  console.log("Sending confirmation for order:", order.orderId);

  // In production, this would trigger backend email/SMS service
  /*
  fetch('/api/send-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId: order.orderId,
      email: order.user.email,
      phone: order.user.phone,
    }),
  });
  */
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
}

function validatePhone(phone) {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");
  // Check if it's a valid Russian phone number (11 digits starting with 7 or 8)
  return cleaned.length === 11 && (cleaned[0] === "7" || cleaned[0] === "8");
}

function formatPhoneInput(event) {
  let input = event.target;
  let value = input.value.replace(/\D/g, "");

  // Add +7 prefix if not present
  if (value.length > 0) {
    if (value[0] === "8") {
      value = "7" + value.substring(1);
    }
    if (value[0] !== "7") {
      value = "7" + value;
    }
  }

  // Format: +7 (XXX) XXX-XX-XX
  let formatted = "+7";
  if (value.length > 1) {
    formatted += " (" + value.substring(1, 4);
  }
  if (value.length >= 5) {
    formatted += ") " + value.substring(4, 7);
  }
  if (value.length >= 8) {
    formatted += "-" + value.substring(7, 9);
  }
  if (value.length >= 10) {
    formatted += "-" + value.substring(9, 11);
  }

  input.value = formatted;
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function clearErrors() {
  const errors = document.querySelectorAll(".checkout-error");
  errors.forEach((error) => {
    error.textContent = "";
    error.style.display = "none";
  });
}

function getPaymentMethodName(method) {
  const methods = {
    card: "Банковская карта",
    cash: "Наличные при получении",
    sbp: "СБП",
  };
  return methods[method] || method;
}

document
  .getElementById("customDiskForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const comments = document.getElementById("comments").value;

    // Bu yerda formani serverga yuborish logikasi bo'ladi
    console.log("Form yuborildi:", { email, name, comments });

    alert("Спасибо! Ваш запрос отправлен.");
    this.reset();
  });
