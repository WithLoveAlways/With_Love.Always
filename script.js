// Add the public form ID from your Formspree dashboard before accepting enquiries.
const FORMSPREE_FORM_ID = "myekoypj";

const products = [
  { id: "soft-blush", name: "Soft Blush", price: 90, priceLabel: "Each", description: "A gentle, romantic candle for quiet evenings.", image: "images/pink.jpeg", imageAlt: "Pink candle in a glass jar with flowers" },
  { id: "golden-hour", name: "Golden Hour", price: 100, priceLabel: "Each", description: "A warm glow for a little everyday luxury.", image: "images/image103.jpeg", imageAlt: "Clear glass bowl candle surrounded by dried flowers" },
  { id: "petal-kiss", name: "Petal Kiss", price: 90, priceLabel: "Each", description: "A floral-inspired gift for someone dear.", image: "images/image102.jpeg", imageAlt: "Pink candle in a glass jar surrounded by dried petals" },
  { id: "love-note", name: "Love Note Gift", price: 100, priceLabel: "Each", description: "A candle made extra special with a message.", image: "images/packages.jpeg", imageAlt: "Gift box with four candles in colored glass jars" },
  { id: "lavender-rose-duo", name: "Lavender & Rose Duo", price: 90, priceLabel: "Each", description: "A floral candle pairing styled with lavender and rose.", image: "images/image7.jpeg", imageAlt: "Two jar candles styled with dried flowers and lavender" },
  { id: "for-you-gift", name: "For You Gift Candle", price: 90, priceLabel: "Each", description: "A candle presented in a keepsake-ready gift box.", image: "images/image8.jpeg", imageAlt: "Single candle displayed in an open gift box" },
  { id: "garden-glow-pair", name: "Garden Glow", price: 100, priceLabel: "Each", description: "Two pink floral candles presented in an amber glass dish.", image: "images/image101.jpeg", imageAlt: "Two pink floral candles in an amber glass dish with dried petals" }
];
const selectedProductIds = new Set();
const productGrid = document.querySelector("#productGrid");
const selectionSummary = document.querySelector("#selectionSummary");
const toast = document.querySelector("#toast");
const orderForm = document.querySelector("#orderForm");
const orderStatus = document.querySelector("#orderStatus");
const reviewForm = document.querySelector("#reviewForm");
const reviewStatus = document.querySelector("#reviewStatus");
const reviewProduct = document.querySelector("#reviewProduct");
let giftDetails = { occasion: "Birthday", recipient: "", message: "", wrap: "Gift-ready packaging (confirm availability)" };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderProducts() {
  reviewProduct.innerHTML += products.map(product => `<option value="${product.name}">${product.name}</option>`).join("");
  productGrid.innerHTML = products.map(product => `
    <article class="product-card"><div class="product-art has-photo"><img class="product-photo" src="${product.image}" alt="${product.imageAlt}" loading="lazy"><span class="product-photo-price">R${product.price.toFixed(0)} ${product.priceLabel}</span></div>
      <div class="product-info"><div class="product-title-row"><h3>${product.name}</h3><span class="price">R${product.price.toFixed(2)} each</span></div><p>${product.description}</p>
      <button class="add-button" aria-pressed="false" data-product="${product.id}" type="button">Add to enquiry</button></div></article>`).join("");
  productGrid.querySelectorAll("[data-product]").forEach(button => button.addEventListener("click", () => {
    const product = products.find(item => item.id === button.dataset.product);
    if (selectedProductIds.has(product.id)) {
      selectedProductIds.delete(product.id);
      showToast(`${product.name} removed from your enquiry.`);
    } else {
      selectedProductIds.add(product.id);
      showToast(`${product.name} added to your enquiry.`);
    }
    updateProductSelection();
  }));
  updateProductSelection();
}

function updateProductSelection() {
  const selectedProducts = products.filter(product => selectedProductIds.has(product.id));
  const count = selectedProducts.length;
  const estimatedTotal = selectedProducts.reduce((total, product) => total + product.price, 0);

  selectionSummary.textContent = count === 0
    ? "No products selected."
    : `${count} product${count === 1 ? "" : "s"} selected. Estimated total: R${estimatedTotal.toFixed(2)}`;

  productGrid.querySelectorAll("[data-product]").forEach(button => {
    const selected = selectedProductIds.has(button.dataset.product);
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = selected ? "Remove from enquiry" : "Add to enquiry";
  });
}

function readGiftForm() {
  giftDetails = {
    occasion: document.querySelector("#occasion").value,
    recipient: document.querySelector("#recipient").value.trim(),
    message: document.querySelector("#giftMessage").value.trim(),
    wrap: document.querySelector("#wrapChoice").value
  };
}
document.querySelector("#giftForm").addEventListener("submit", event => {
  event.preventDefault(); readGiftForm();
  showToast("Gift details saved for this visit. Choose your candles and send your email enquiry.");
  document.querySelector("#order").scrollIntoView({ behavior: "smooth" });
});
orderForm.addEventListener("submit", async event => {
  event.preventDefault();
  const selectedProducts = products.filter(product => selectedProductIds.has(product.id));
  if (selectedProducts.length === 0) {
    orderStatus.textContent = "Choose at least one candle before sending your enquiry.";
    document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (FORMSPREE_FORM_ID === "YOUR_FORMSPREE_FORM_ID") {
    orderStatus.textContent = "Email requests aren't connected yet. Add your Formspree form ID in script.js to receive orders.";
    return;
  }

  readGiftForm();
  const submitButton = orderForm.querySelector("button[type='submit']");
  const formData = new FormData(orderForm);
  formData.append("_replyto", formData.get("email"));
  formData.append("_subject", `Candle gift enquiry: ${selectedProducts.length} item${selectedProducts.length === 1 ? "" : "s"}`);
  formData.append("Products", selectedProducts.map(product => `${product.name} (R${product.price.toFixed(2)} each)`).join("\n"));
  formData.append("Occasion", giftDetails.occasion);
  formData.append("Gift recipient", giftDetails.recipient || "Not specified");
  formData.append("Gift message", giftDetails.message || "No message added");
  formData.append("Packaging", giftDetails.wrap);
  formData.append("message", "Please confirm availability, final price and delivery or pick-up options before payment.");

  submitButton.disabled = true;
  orderStatus.textContent = "Sending your enquiry...";
  try {
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Form submission failed");
    orderForm.reset();
    selectedProductIds.clear();
    updateProductSelection();
    orderStatus.textContent = "Your enquiry was sent. We'll reply to your email soon.";
  } catch {
    orderStatus.textContent = "We couldn't send your enquiry. Please try again in a moment.";
  } finally {
    submitButton.disabled = false;
  }
});
reviewForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (FORMSPREE_FORM_ID === "YOUR_FORMSPREE_FORM_ID") {
    reviewStatus.textContent = "Reviews aren't connected yet. Please try again later.";
    return;
  }

  const submitButton = reviewForm.querySelector("button[type='submit']");
  const formData = new FormData(reviewForm);
  formData.append("_subject", "Customer review submission - approval required");
  formData.append("message", [
    `Review by: ${formData.get("name")}`,
    `Rating: ${formData.get("rating")} stars`,
    `Candle: ${formData.get("product") || "General review"}`,
    `Review: ${formData.get("review")}`,
    `Publication consent: ${formData.get("publicationConsent") === "yes" ? "Yes" : "No"}`
  ].join("\n"));

  submitButton.disabled = true;
  reviewStatus.textContent = "Sending your review...";
  try {
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Review submission failed");
    reviewForm.reset();
    reviewStatus.textContent = "Thank you. Your review was sent for approval and will not appear until it has been checked.";
  } catch {
    reviewStatus.textContent = "We couldn't send your review. Please try again in a moment.";
  } finally {
    submitButton.disabled = false;
  }
});
const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open"); menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
}));
document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
