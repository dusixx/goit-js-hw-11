import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import makeImageCard from './image-gallery-markup';
import { getImageData } from './pixabay-service';
import utils from './utils';

const { formatNumber, getFileType, saveFileAs } = utils;

const defOpts = {
  addTransparentBg: true,
  transparentBgClass: 'transparent-bg',
};

export default class ImageGallery {
  #ref;
  #options;
  #className;
  #simpleLightBox;

  /**
   * @param {string} classSelector
   * @param {object} opts - объект опций
   */
  constructor(classSelector, opts) {
    if (/\s/.test(classSelector)) {
      throw new Error('Single class name expected');
    }

    this.#ref = document.querySelector(classSelector);
    const { nodeName } = this.#ref || '';

    if (nodeName !== 'UL' && nodeName !== 'DIV') {
      throw new Error('<ul> or <div> element expected');
    }

    this.options = opts;
    this.#className = this.ref.className;

    // ставим обработчик кликов
    this.#ref.addEventListener('click', handleGalleryClick);

    // инициализируем simpleLightbox
    this.#simpleLightBox = new SimpleLightbox(`.${this.#className}__link`, {
      captionsData: 'alt',
    });
  }

  /**
   * @param {array} data - массив hit-обьектов
   * @returns разметку карточек для группы изображений
   */
  #makeMarkup(data = []) {
    return data.map(itm => this.#makeImageCard(itm)).join('');
  }

  /**
   * @param {object} hit - объект с параметрами изображения
   * @returns разметку для карточки изображения
   */
  #makeImageCard(hit) {
    const { addTransparentBg, transparentBgClass } = this.options;

    // png не гарантирует прозрачность
    const transpBgClass =
      addTransparentBg && getFileType(hit.largeImageURL) === 'png'
        ? transparentBgClass
        : '';

    return makeImageCard({
      ...getImageData(hit),
      transpBgClass,
      galleryClassName: this.#className,
    });
  }

  /**
   * @param {array} data - данные изображений с сервера (hits)
   * @returns промис, ожидающий загрузки последнего изображения
   */
  append(data) {
    this.ref.insertAdjacentHTML('beforeend', this.#makeMarkup(data));

    // реинициализируем SimpleLightbox
    this.#simpleLightBox.refresh();

    // учитывая lazy, подгрузится при скроле
    const lastImage = this.ref.lastElementChild?.querySelector('img');
    if (lastImage) return waitForImageLoading(lastImage);
  }

  set options(opts) {
    this.#options = { ...defOpts, ...this.#options, ...opts };
  }

  get options() {
    return { ...this.#options };
  }

  get ref() {
    return this.#ref;
  }

  get length() {
    return this.ref.children?.length;
  }

  get isEmpty() {
    return this.length === 0;
  }

  clear() {
    this.ref.innerHTML = '';
  }
}

/**
 * @param {object} img
 * @returns промис, который выполнится в момент загрузки img
 */
function waitForImageLoading(img) {
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

function handleGalleryClick(e) {
  const btn = e.target.closest('.gallery__download-btn');

  if (btn) {
    e.preventDefault();
    saveFileAs(btn.href, btn.dataset.filename);
  }
}
