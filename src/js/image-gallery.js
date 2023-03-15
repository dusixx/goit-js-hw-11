export default class ImageGallery {
  #ref;
  /**
   *
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

  append(data) {
    this.ref.insertAdjacentHTML('beforeend', this.#makeMarkup(data));
  }

  prepend(data) {
    this.ref.insertAdjacentHTML('afterbegin', this.#makeMarkup(data));
  }

  get ref() {
    return this.#ref;
  }

  get length() {
    return this.ref.children.length;
  }

  clear() {
    this.ref.innerHTML = '';
  }
}
