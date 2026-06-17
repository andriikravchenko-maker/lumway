(function () {
  function trackAmplitudeEvent(eventName, eventProperties) {
    var amp = window.amplitude;
    var track = null;
    if (amp && typeof amp.track === "function") track = amp.track.bind(amp);
    else if (amp && amp.default && typeof amp.default.track === "function")
      track = amp.default.track.bind(amp.default);
    else if (amp && typeof amp.getInstance === "function") {
      try {
        var inst = amp.getInstance();
        if (inst && typeof inst.logEvent === "function") {
          track = function (n, p) {
            inst.logEvent(n, p);
          };
        }
      } catch (e) {}
    }
    if (track) {
      try {
        track(eventName, eventProperties);
      } catch (e) {}
    }
  }

  function resolveCartJsUrl() {
    if (
      typeof window.Shopify !== "undefined" &&
      window.Shopify.routes &&
      window.Shopify.routes.root
    ) {
      return String(window.Shopify.routes.root).replace(/\/?$/, "/") + "cart.js";
    }
    return "/cart.js";
  }

  function getBundleTypeFromItem(item) {
    var props = item && item.properties;
    if (!props || typeof props !== "object") return "";
    var candidates = [
      props.bundle_type,
      props._bundle_type,
      props.Bundle,
      props["Bundle type"],
      props.bundle,
    ];
    for (var i = 0; i < candidates.length; i++) {
      var v = candidates[i];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  }

  function buildCheckoutStartedProps(cart) {
    var ids = [];
    var titles = [];
    var bundles = [];
    var items = (cart && cart.items) || [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.properties && String(item.properties._is_free_gift) === "true") {
        continue;
      }
      if (item.product_id != null) ids.push(String(item.product_id));
      var title =
        item.product_title != null && String(item.product_title).trim() !== ""
          ? String(item.product_title).trim()
          : item.title != null
            ? String(item.title).trim()
            : "";
      titles.push(title);
      bundles.push(getBundleTypeFromItem(item));
    }
    return {
      product_id: ids.join(","),
      product_title: titles.join(" | "),
      bundle_type: bundles.join(","),
    };
  }

  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest(".cart__checkout-button");
      if (!btn) return;
      if (btn.disabled || btn.getAttribute("aria-disabled") === "true") return;
      if (btn.dataset.amplitudeCheckoutSubmitting === "1") return;

      var form = btn.form;
      if (!form && btn.getAttribute("form")) {
        form = document.getElementById(btn.getAttribute("form"));
      }
      if (!form) {
        trackAmplitudeEvent("checkout_started", {
          product_id: "",
          product_title: "",
          bundle_type: "",
        });
        return;
      }

      e.preventDefault();
      btn.dataset.amplitudeCheckoutSubmitting = "1";

      var fallback = function () {
        trackAmplitudeEvent("checkout_started", {
          product_id: "",
          product_title: "",
          bundle_type: "",
        });
      };

      fetch(resolveCartJsUrl(), { credentials: "same-origin" })
        .then(function (r) {
          if (!r.ok) throw new Error("cart.js");
          return r.json();
        })
        .then(function (cart) {
          trackAmplitudeEvent(
            "checkout_started",
            buildCheckoutStartedProps(cart)
          );
        })
        .catch(fallback)
        .then(function () {
          btn.dataset.amplitudeCheckoutSubmitting = "";
          try {
            if (typeof form.requestSubmit === "function") {
              form.requestSubmit(btn);
            } else {
              form.submit();
            }
          } catch (subErr) {
            form.submit();
          }
        });
    },
    true
  );
})();
