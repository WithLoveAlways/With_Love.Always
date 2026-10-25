# With Love, Always — candle gift website

A beginner-friendly static website starter built with HTML, CSS and JavaScript.

## Open it
1. Download and extract the ZIP folder.
2. Open `index.html` in your browser, or open the folder in VS Code and use Live Server.
3. Edit the content in `index.html`, the visual design in `styles.css`, and the catalogue/order behaviour in `script.js`.

## Before taking real orders
- Create a form with Formspree and replace `YOUR_FORMSPREE_FORM_ID` in `script.js` with its form ID. Set your private reply-to/notification email in the Formspree dashboard; the email address is not stored in this repository.
- To enable WhatsApp ordering, replace `27XXXXXXXXX` in `script.js` with your public business number in international digits-only format (country code included, no `+`, spaces, or punctuation). Direct WhatsApp links expose this number to visitors.
- The public form ID does not hide data submitted by visitors from Formspree. Add a privacy notice explaining how customer email addresses and gift details are handled.
- The displayed product prices are examples, not validated prices. Calculate wax, fragrance, wick, vessel, labels, packaging and delivery costs first.
- Add real product photographs, candle safety information, delivery/returns terms and a privacy notice.
- Check the brand name and domain availability before investing in packaging or advertising.

This is a front-end prototype and does not take payment. Once Formspree is configured, it receives and stores enquiry submissions according to your account settings.

## Checks and deployment
- Run `node --test` to check JavaScript syntax, local asset paths and page anchors.
- GitHub Actions runs these checks on pushes to `main` and deploys the site to GitHub Pages when they pass.
- Before the first deployment, open the repository's **Settings > Pages** and set the build and deployment source to **GitHub Actions**.
