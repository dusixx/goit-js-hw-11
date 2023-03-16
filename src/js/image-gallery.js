const previewWidth = {
  tiny: 180,
  small: 340,
  middle: 640,
  large: 1280,
};

export default class ImageGallery {
  #ref;

  /**
   * @param {string} classSelector
   * @param {*} opts
   */
  constructor(classSelector, opts = {}) {
    this.#ref = document.querySelector(classSelector);

    if (this.ref?.nodeName !== 'UL') {
      throw new Error('Unordered list expected');
    }
  }

  #makeMarkup(data = []) {
    return data
      .map(itm => {
        const d = getImageData(itm);

        // console.log(d);

        // todo: лучше сделать srcset, для 1х 2х как на сайте pixabay
        return `
            <li class=${this.ref.className}__item>
              <img src="${d.preview.small.url}" 
              alt="${d.tags}"
                width = "${d.preview.small.width}" loading="lazy">
            </li>`;
      })
      .join('');
  }

  /**
   * @param {array} data - данные изображений с сервера (hits)
   * @returns промис, ожидающий загрузки последнего изображения
   */
  append(data) {
    this.ref.insertAdjacentHTML('beforeend', this.#makeMarkup(data));

    const lastImage = this.ref.lastElementChild?.firstElementChild;
    if (lastImage) return waitForImage(lastImage);
  }

  get ref() {
    return this.#ref;
  }

  get isEmpty() {
    return this.length === 0;
  }

  get length() {
    return this.ref.children?.length;
  }

  clear() {
    this.ref.innerHTML = '';
  }
}

function waitForImage(img) {
  return new Promise(resolve => {
    img.addEventListener(
      'load',
      ({ target }) => {
        resolve(target);
      },
      { once: true }
    );
  });
}

function replaceWidth(url, width) {
  return url.replace(/(_\d+)(?=\.\w+$)/, `_${width}`);
}

// todo: галлерея ничего не должна занть о hits и тп
// Нужно передавать понятные данные: ссылки на 1x 2x
// ссылку на большое изображение, данные для оверлея как-то
// alt-текст и тп

/**
 * @param {*} hit - данные изображения из массива hits[]
 * @returns объект с необходимыми(доступными для free) данными
 */
function getImageData(hit) {
  const {
    webformatURL,
    webformatWidth,
    pageURL: homePage,
    // для free версии акка не приходит(?)
    imageURL: url,
    imageWidth: width,
    imageHeight: height,
    imageSize: size,
    largeImageURL,
    tags,
    views,
    downloads,
    likes,
    comments,
  } = hit;

  const smallURL = replaceWidth(webformatURL, previewWidth.small);
  const middleURL = replaceWidth(webformatURL, previewWidth.middle);

  return {
    preview: {
      normal: { url: webformatURL, width: webformatWidth },
      small: { url: smallURL, width: previewWidth.small },
      middle: { url: middleURL, width: previewWidth.middle },
      large: { url: largeImageURL, width: previewWidth.large },
    },
    width,
    height,
    size,
    url,
    homePage,
    tags,
    views,
    downloads,
    likes,
    comments,
  };
}
