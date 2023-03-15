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
                <img src="${webformatURL}" alt="${tags}"
                width="320" loading="lazy">
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
