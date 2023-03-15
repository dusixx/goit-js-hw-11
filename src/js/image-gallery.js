export default class ImageGallery {
  #ref;

  /**
   * @param {string} classSelector
   * @param {*} opts
   */
  constructor(classSelector, opts = {}) {
    this.#ref = document.querySelector(classSelector);

    if (this.ref?.nodeName !== 'UL') {
      throw new Error('<ul>...</ul> expected');
    }
  }

  #makeMarkup(data = []) {
    return data
      .map(itm => {
        const { webformatURL, webformatHeight, webformatWidth, tags } = itm;
        return `
            <li class=${this.ref.className}__item>
                <a><img src="${webformatURL}" alt="${tags}"
                width="320" loading="lazy">
                </a>
            </li>`;
      })
      .join('');
  }

  /**
   * @param {array} data - данные изображений с сервера
   * @returns промис, ожидающий загрузки последнего изображения
   */
  append(data) {
    this.ref.insertAdjacentHTML('beforeend', this.#makeMarkup(data));

    const lastImage = this.ref.lastElementChild?.children[0].children[0];
    if (lastImage) return waitForImage(lastImage);
  }

  get ref() {
    return this.#ref;
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
