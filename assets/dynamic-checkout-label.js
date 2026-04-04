/**
 * Uses the theme's Add to cart translation for the unbranded dynamic checkout
 * button when Shopify renders "Buy it now" in accessible markup.
 * Accelerated checkout inside a closed shadow DOM cannot be changed from theme JS.
 */
(function () {
  function replacementLabel() {
    return (window.variantStrings && window.variantStrings.addToCart) || 'Add to Cart';
  }

  function isBuyNowLabel(text) {
    const t = (text || '').trim();
    return /^buy it now$/i.test(t) || /^buy now$/i.test(t);
  }

  function patchElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    const label = replacementLabel();

    if (el.matches('button, [role="button"]')) {
      if (el.children.length === 0 && isBuyNowLabel(el.textContent)) {
        el.textContent = label;
        return;
      }
      el.querySelectorAll('span, div').forEach((node) => {
        if (node.children.length === 0 && isBuyNowLabel(node.textContent)) {
          node.textContent = label;
        }
      });
    }
  }

  function patchRoot(root) {
    if (!root || !root.querySelectorAll) return;

    root.querySelectorAll('.shopify-payment-button__button--unbranded').forEach(patchElement);

    root.querySelectorAll('.shopify-payment-button .shopify-payment-button__button').forEach((btn) => {
      if (!btn.classList.contains('shopify-payment-button__button--unbranded')) return;
      patchElement(btn);
    });

    root.querySelectorAll('*').forEach((host) => {
      if (host.shadowRoot) {
        patchRoot(host.shadowRoot);
      }
    });
  }

  function run() {
    document.querySelectorAll('.shopify-payment-button, shopify-accelerated-checkout').forEach((container) => {
      patchRoot(container);
    });
  }

  let debounceTimer;
  function scheduleRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      run();
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleRun);
  } else {
    scheduleRun();
  }

  new MutationObserver(scheduleRun).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
