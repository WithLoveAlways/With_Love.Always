import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const html = readFileSync(path.join(rootDirectory, "index.html"), "utf8");

test("site JavaScript passes Node syntax checking", () => {
  const result = spawnSync(process.execPath, ["--check", "script.js"], {
    cwd: rootDirectory,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("local HTML assets exist", () => {
  const localReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => !/^(?:[a-z]+:|#|\/\/)/i.test(reference));

  for (const reference of localReferences) {
    assert.ok(existsSync(path.join(rootDirectory, reference)), `Missing HTML asset: ${reference}`);
  }
});

test("product photos exist", () => {
  const script = readFileSync(path.join(rootDirectory, "script.js"), "utf8");
  const productImages = [...script.matchAll(/\bimage:\s*"([^"]+)"/g)]
    .map((match) => match[1]);

  assert.ok(productImages.length > 0, "No product image paths found in script.js");
  for (const imagePath of productImages) {
    assert.ok(existsSync(path.join(rootDirectory, imagePath)), `Missing product image: ${imagePath}`);
  }
});

test("every product photo displays its per-item price", () => {
  const script = readFileSync(path.join(rootDirectory, "script.js"), "utf8");
  const priceLabels = [...script.matchAll(/priceLabel:\s*"Each"/g)];

  assert.equal(priceLabels.length, 7, "Expected every product to define an Each price label");
  assert.match(script, /class="product-photo-price">R\$\{product\.price\.toFixed\(0\)\} \$\{product\.priceLabel\}/);
  assert.match(html, /class="hero-price-note">Prices are per candle</);
});

test("cart supports quantities, removal, and enquiry totals", () => {
  const script = readFileSync(path.join(rootDirectory, "script.js"), "utf8");

  assert.match(html, /id="cartItems"/);
  assert.match(html, /id="cartSubtotal"/);
  assert.match(script, /const cart = new Map\(\)/);
  assert.match(script, /data-increase/);
  assert.match(script, /data-decrease/);
  assert.match(script, /data-remove/);
  assert.match(script, /formData\.append\("Estimated subtotal"/);
  assert.match(script, /Add at least one candle to your cart before sending your enquiry/);
});

test("reviews require consent and are submitted for manual approval", () => {
  const script = readFileSync(path.join(rootDirectory, "script.js"), "utf8");

  assert.match(html, /id="reviewForm"/);
  assert.match(html, /name="publicationConsent" type="checkbox" value="yes" required/);
  assert.match(html, /No reviews yet/);
  assert.match(script, /Customer review submission - approval required/);
  assert.match(script, /will not appear until it has been checked/);
});

test("product photos fit without cropping", () => {
  const imageStyles = readFileSync(path.join(rootDirectory, "images.css"), "utf8");

  assert.match(imageStyles, /\.product-photo\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(imageStyles, /\.product-art\.has-photo\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/s);
});

test("in-page links point to existing elements", () => {
  const elementIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const fragmentTargets = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);

  for (const target of fragmentTargets) {
    assert.ok(elementIds.has(target), `No element found for #${target}`);
  }
});

test("private email enquiry form replaces direct WhatsApp contact", () => {
  const script = readFileSync(path.join(rootDirectory, "script.js"), "utf8");

  assert.match(html, /id="orderForm"/);
  assert.match(html, /id="customerEmail"/);
  assert.match(script, /https:\/\/formspree\.io\/f\/\$\{FORMSPREE_FORM_ID\}/);
  assert.doesNotMatch(script, /wa\.me|WHATSAPP_NUMBER/);
});