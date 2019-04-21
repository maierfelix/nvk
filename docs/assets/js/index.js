let clickedElement = null;

let root = IS_ROOT ? `.` : `..`;

function $(q) { return document.querySelector(q); };

function loadJSON(path) {
  return new Promise(resolve => {
    fetch(path)
    .then(resp => resp.json())
    .then(json => resolve(json));
  });
};

function applyCategoryClickListenerFix() {
  let details = document.querySelectorAll("details");
  details.forEach(d => {
    d.onclick = e => {
      if (e.target === d) d.children[0].click();
    };
  });
};

function performSearch(search) {
  search = search.trim().toUpperCase();
  let matches = 0;
  let {children} = $(`#search-list`);
  // show matching items
  for (let ii = 0; ii < children.length; ++ii) {
    let child = children[ii];
    if (child.id === `no-search-results`) continue;
    let text = child.children[0].innerHTML;
    if (search.length > 0 && text.toUpperCase().indexOf(search) > -1) {
      child.style.display = "block";
      matches++;
    } else {
      child.style.display = "none";
    }
  };
  if (matches <= 0) {
    $(`#no-search-results`).style.display = `block`;
  } else {
    $(`#no-search-results`).style.display = `none`;
  }
};

function elementIsChildOf(el, root) {
  let node = el;
  while (node !== null) {
    if (node === root) return true;
    node = node.parentNode;
  };
  return false;
};

function loadSearchBar() {
  let html = ``;
  loadJSON(`${root}/search.json`).then(json => {
    json.map(arr => {
      let [name, label, folder] = arr;
      let el = document.createElement("li");
      let link = `${root}/${folder}/${name}.html`;
      html += `<li label="${label}"><a href="${link}">${name}</a></li>`;
    });
    $(`#search-list`).insertAdjacentHTML("beforeend", html);
  });
};

function loadCategories() {
  let html = ``;
  loadJSON(`${root}/categories.json`).then(json => {
    json.map(entry => {
      html += `<details>`;
      html += `<summary>${entry.category}</summary>`;
      html += `<ol>`;
      entry.objects.map(arr => {
        let [name, label, folder] = arr;
        let link = `${root}/${folder}/${name}.html`;
        html += `<li label="${label}"><a href="${link}">${name}</a></li>`;
      });
      html += `</ol>`;
      html += `</details>`;
    });
    $(`vk-categories`).insertAdjacentHTML("beforeend", html);
    applyCategoryClickListenerFix();
  });
};

let el = $(`#search`);
el.onfocus = e => {
  $(`#search-list`).style.display = `block`;
  performSearch(el.value);
};
el.onblur = e => {
  if (!elementIsChildOf(clickedElement, $(`vk-search`))) {
    $(`#search-list`).style.display = `none`;
  }
};
el.oninput = e => {
  performSearch(el.value);
  $(`#search-list`).style.display = `block`;
};
el.onkeyup = e => {
  if (e.key === `Escape`) el.blur();
};

window.onmousedown = e => {
  clickedElement = e.target;
  el.onblur();
};

let codeExpandQuery = "nvk-code-expand";
let codeNeedsExpansion = localStorage.getItem(codeExpandQuery) === "true";

let expandCodeBtn = $(`#expand-code`);
let expandedCode = $(`#code-expanded`);
let nonExpandedCode = $(`#code-no-expand`);

function updateCodeExpandState() {
  if (!expandedCode || !nonExpandedCode || !expandCodeBtn) return;
  if (codeNeedsExpansion) {
    expandedCode.style.display = "block";
    nonExpandedCode.style.display = "none";
  }
  else {
    expandedCode.style.display = "none";
    nonExpandedCode.style.display = "block";
  }
  expandCodeBtn.innerHTML = codeNeedsExpansion ? "Implicit" : "Explicit";
};

updateCodeExpandState();

if (expandCodeBtn) {
  expandCodeBtn.onclick = e => {
    codeNeedsExpansion = !!!codeNeedsExpansion;
    updateCodeExpandState();
    localStorage.setItem(codeExpandQuery, codeNeedsExpansion + "");
  };
}

document.title = $(`vk-title`).innerHTML;

loadSearchBar();
loadCategories();
