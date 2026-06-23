(function () {
  const icons = {
    "map-pin": [
      ["path", { d: "M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 1 1 16 0" }],
      ["circle", { cx: "12", cy: "10", r: "3" }]
    ],
    "calendar": [
      ["path", { d: "M8 2v4M16 2v4M3 10h18" }],
      ["rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }]
    ],
    "calendar-check-2": [
      ["path", { d: "M8 2v4M16 2v4M3 10h18" }],
      ["path", { d: "m9 16 2 2 4-4" }],
      ["rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }]
    ],
    "user-check": [
      ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
      ["circle", { cx: "9", cy: "7", r: "4" }],
      ["path", { d: "m16 11 2 2 4-4" }]
    ],
    "phone-call": [
      ["path", { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1" }],
      ["path", { d: "M14.1 2a6 6 0 0 1 7.9 7.9M14.1 6A2 2 0 0 1 18 9.9" }]
    ],
    "message-circle": [
      ["path", { d: "M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.6-4.5A8.5 8.5 0 1 1 21 11.5" }]
    ],
    "phone": [
      ["path", { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1" }]
    ],
    "user-round": [
      ["circle", { cx: "12", cy: "8", r: "5" }],
      ["path", { d: "M20 21a8 8 0 0 0-16 0" }]
    ],
    "check-circle-2": [
      ["path", { d: "M22 11.1V12a10 10 0 1 1-5.9-9.1" }],
      ["path", { d: "m9 11 3 3L22 4" }]
    ],
    "leaf": [
      ["path", { d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5.8 18.4 3 20 2c0 4-1 12-9 18" }],
      ["path", { d: "M2 21c0-3 1.9-5.4 5-6.8" }]
    ],
    "send": [
      ["path", { d: "m22 2-7 20-4-9-9-4Z" }],
      ["path", { d: "M22 2 11 13" }]
    ],
    "x": [
      ["path", { d: "M18 6 6 18M6 6l12 12" }]
    ],
    "alert-circle": [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 8v4M12 16h.01" }]
    ],
    "loader-2": [
      ["path", { d: "M21 12a9 9 0 1 1-6.2-8.6" }]
    ]
  };

  function createIcon(node) {
    const name = node.getAttribute("data-lucide");
    const parts = icons[name];
    if (!parts) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for (const attribute of node.attributes) {
      if (attribute.name !== "data-lucide") svg.setAttribute(attribute.name, attribute.value);
    }
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("data-lucide", name);

    for (const [tag, attributes] of parts) {
      const child = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [key, value] of Object.entries(attributes)) child.setAttribute(key, value);
      svg.appendChild(child);
    }
    node.replaceWith(svg);
  }

  window.lucide = {
    createIcons(options = {}) {
      const nodes = options.nodes || document.querySelectorAll("[data-lucide]:not(svg)");
      Array.from(nodes).forEach(createIcon);
    }
  };
})();
