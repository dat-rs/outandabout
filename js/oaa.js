/* Out and About

   Carousels and lightbox on every page; on the feed and grid, tag filtering.

   Filtering works as on soldesignarchive's artefacts page: Isotope lays the
   items out, and each item carries a class per tag (tag-{slug}). Ticking
   tags shows artefacts with ANY of them, as within one filter group there.
   The selection lives in ?tags=a,b so it survives the switch between feed
   and grid, and so a tag link from an artefact's own page lands filtered. */

(function () {
  "use strict";

  // Photos ------------------------------------------------------------------

  if (window.Carousel) {
    document.querySelectorAll("[data-oa-carousel]").forEach(function (el) {
      new Carousel(el, { infinite: false });
    });
  }

  if (window.Fancybox) {
    Fancybox.bind("[data-fancybox]", {
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: ["zoomIn", "zoomOut", "toggle1to1"],
          right: ["close"],
        },
      },
    });
  }

  // Tag list: collapsible below md, where it would push the feed down -------

  document.querySelectorAll("[data-oa-collapsible]").forEach(function (group) {
    var toggle = group.querySelector(".oa-filter-toggle");
    toggle.addEventListener("click", function () {
      var open = group.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  // Filtering ---------------------------------------------------------------

  var container = document.getElementById("oa-isotope");
  var filters = document.getElementById("oa-filters");
  if (!container || !filters || !window.Isotope) return;

  var boxes = Array.prototype.slice.call(filters.querySelectorAll("input[type=checkbox]"));
  var count = document.getElementById("oa-count");
  var clear = document.getElementById("oa-clear");
  var total = Number(count.dataset.total);

  var iso = new Isotope(container, {
    itemSelector: ".oa-item",
    percentPosition: true,
    layoutMode: container.dataset.view === "grid" ? "masonry" : "vertical",
    // The grid's tiles are all square, so masonry here is just an even grid
    // that, unlike fitRows, tolerates percentage widths rounding over 100%.
    masonry: { columnWidth: ".oa-grid-sizer" },
  });

  function selectedTags() {
    return boxes.filter(function (box) { return box.checked; }).map(function (box) { return box.value; });
  }

  function apply() {
    var tags = selectedTags();

    iso.arrange({
      filter: tags.length ? tags.map(function (tag) { return ".tag-" + tag; }).join(", ") : "*",
    });

    var shown = iso.filteredItems.length;
    count.textContent = tags.length
      ? shown + " of " + total + " artefacts"
      : total + (total === 1 ? " artefact" : " artefacts");
    clear.hidden = !tags.length;

    // Slugs are URL-safe already; building the query by hand keeps the
    // commas readable instead of %2C.
    var query = tags.length ? "?tags=" + tags.join(",") : "";
    history.replaceState(null, "", location.pathname + query + location.hash);
    document.querySelectorAll("[data-oa-keep-query]").forEach(function (link) {
      link.search = query;
    });
  }

  function only(tag) {
    boxes.forEach(function (box) { box.checked = box.value === tag; });
    apply();
  }

  // Start from the URL's selection. Unknown tags are ignored.
  var wanted = (new URLSearchParams(location.search).get("tags") || "").split(",");
  boxes.forEach(function (box) { box.checked = wanted.indexOf(box.value) !== -1; });
  apply();

  filters.addEventListener("change", apply);

  clear.addEventListener("click", function () {
    boxes.forEach(function (box) { box.checked = false; });
    apply();
  });

  // A tag under an artefact in the feed filters to that tag alone, in place.
  container.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-tag]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    only(link.dataset.tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Item heights depend on the webfonts (the text) and on the viewport
  // height (the photo stage is capped to it). Isotope relayouts on width
  // changes only, so cover the other two.
  if (document.fonts) {
    document.fonts.ready.then(function () { iso.layout(); });
  }

  var resizeTimer;
  var lastHeight = window.innerHeight;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerHeight !== lastHeight) {
        lastHeight = window.innerHeight;
        iso.layout();
      }
    }, 150);
  });
})();
