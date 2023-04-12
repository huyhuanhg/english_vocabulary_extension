const getSelectionText = () => {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }
  return text;
};

const show = async (e, select) => {
  const translateText = await trans(select);

  if (!translateText) {
    return;
  }

  const transWrapper = document.createElement("div");
  transWrapper.id = "english_vocabulary";

  const contentBox = document.createElement("div");
  contentBox.id = "english_vocabulary__content";
  contentBox.innerText = translateText;

  const icon = document.createElement("div");
  icon.id = "english_vocabulary__icon";

  icon.onclick = () => {
    icon.style.background = "unset"
    icon.style.boxShadow = "unset"
  };

  transWrapper.append(contentBox);
  transWrapper.append(icon);

  transWrapper.style.left = `${e.clientX - 50}px`;

  if (e.clientY < 100) {
    transWrapper.style.top = `${e.clientY + 30}px`;
  } else {
    transWrapper.style.top = `${e.clientY - 40}px`;
  }

  document.body.append(transWrapper);
};

const hide = () => {
  document.querySelector("#english_vocabulary")?.remove();
};

document.onmouseup = (e) => {
  if (e.target.id.match(/^english_vocabulary/)) {
    return;
  }

  if (e.which !== 1) {
    return;
  }

  const select = getSelectionText();

  if (select.length > 1000) {
    return;
  }

  if (!select.match(/\w+/)) {
    return;
  }

  show(e, select);
};

document.onmousedown = (e) => {
  if (e.target.id.match(/^english_vocabulary/)) {
    return;
  }
  hide();
};

const trans = async (text) => {
  var headers = new Headers();
  headers.append("Accept", "application/json");
  var requestOptions = {
    headers: headers,
  };

  return fetch(
    `${transBaseUrl}/translate_a/single?client=gtx&sl=en&tl=vi&hl=en-US&dt=t&dj=1&q=${text}`,
    requestOptions
  )
    .then((result) => result.json())
    .then((data) => {
      const lang = data.src;

      if (lang !== "en") {
        throw new Error("The text is not English!");
      }

      return data.sentences[0].trans;
    })
    .catch((e) => new Error("Translate failure!"));
};
