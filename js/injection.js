const getSelectionText = () => {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }

  text = text
    .trim()
    .replaceAll(/(\s)\s+/g, "$1")
    .toLowerCase();

  // TODO handle translate multiple languages
  if (true) {
    return removeVietnameseTones(text);
  }

  return text;
};

const show = async (e, text) => {
  const translateText = await trans(text);

  if (!translateText) {
    return;
  }

  const transWrapper = document.createElement("div");
  transWrapper.id = "english_vocabulary";

  const contentBox = document.createElement("div");
  contentBox.id = "english_vocabulary__content";
  contentBox.innerText = translateText.toLowerCase();

  const icon = document.createElement("div");
  icon.id = "english_vocabulary__icon";

  icon.onclick = () => {
    icon.classList.add("loading");
    sync(text, translateText.toLowerCase())
      .then(() => {
        icon.classList.remove("loading");
        icon.classList.add("success");
      })
      .catch((err) => {
        icon.classList.remove("loading");
        icon.classList.add("failure");
      })
      .finally(() => {
        setTimeout(() => {
          transWrapper.remove();
        }, 1000);
      });
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
    `${TRANSLATE_BASEURL}/translate_a/single?client=gtx&sl=en&tl=vi&hl=en-US&dt=t&dj=1&q=${text}`,
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

const sync = async (en, vi) => {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Content-Type", "application/json");

  const primaryValue = md5(en)
  const today = new Date()
  const now = `${today.getDay()}/${today.getMonth()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`

  const raw = JSON.stringify({
    Mean: vi,
    Vocabulary: en,
    Hash: primaryValue,
    Created_At: now,
    Updated_At: now,
  });

  var requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
  };

  return fetch(
    `${FIREBASE_URL}/${FIREBASE_SHEET_ID}/${FIREBASE_TABLE_NAME}/${primaryValue}.json?auth=${FIREBASE_SECRET}`,
    requestOptions
  ).then((result) => {
    if (!result.ok) {
      throw new Error("Sync Failure!");
    }

    return Promise.resolve(result);
  });
};

const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str;
};
