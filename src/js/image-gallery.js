import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const TRANSP_BG_CLASS = 'transparent-bg';
const TRANSP_BG_IMG_CLASS = 'transparent-img';

export default class ImageGallery {
  #ref;
  #simpleLightBox;

  /**
   * @param {string} classSelector
   * @param {object} opts
   */
  constructor(classSelector, opts = {}) {
    this.#ref = document.querySelector(classSelector);

    const { nodeName } = this.#ref || '';

    if (nodeName !== 'UL' && nodeName !== 'DIV') {
      throw new Error('Invalid gallery element');
    }

    // инициализируем simpleLightbox
    this.#simpleLightBox = new SimpleLightbox(`${classSelector} a`, {
      captionsData: 'alt',
    });
  }

  /**
   * @param {array} data - массив hit-обьектов
   * @returns - разметку карточек для группы изображений
   */
  #makeMarkup(data = []) {
    return data.map(itm => this.#makeImageCard(itm)).join('');
  }

  /**
   * @param {object} hit - объект с параметрами изображения
   * @returns - разметку для одной карточки изображения
   */
  #makeImageCard(hit) {
    const { className } = this.ref;
    const { tags, preview } = getImageData(hit);
    const { small, middle, large } = preview;

    // NOTE: png не гарантирует что фон прозрачный
    // TODO: лучше сделать пропорциональные размеры для всех

    // классы для изображений с прозрачным фоном
    const transpBg = getImageType(hit) === 'png' ? TRANSP_BG_CLASS : '';
    const transpBgImg = ''; //transpBg ? TRANSP_BG_IMG_CLASS : '';

    return `
      <li class="${className}__item ${transpBg}">
        <a href="${large.url}">
          <img class="${className}__img ${transpBgImg}"
            srcset = "${small.url} 1x, ${middle.url} 2x"
            src="${small.url}"
            alt="${tags}"
            loading="lazy">
        </a>
      </li>`;
  }

  /**
   * @param {array} data - данные изображений с сервера (hits)
   * @returns промис, ожидающий загрузки последнего изображения
   */
  append(data) {
    this.ref.insertAdjacentHTML('beforeend', this.#makeMarkup(data));

    // реинициализируем SimpleLightbox
    this.#simpleLightBox.refresh();

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

//
// Helpers
//

function getImageType(hit) {
  return hit.largeImageURL.match(/[^\.]+$/)[0].toLowerCase();
}

/**
 * @param {HTMLImageElement} img
 * @returns Promise
 */
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

const replaceURLWidth = (url, width) =>
  url.replace(/(_\d+)(?=\.\w+$)/, `_${width}`);

/**
 * @param {*} hit - данные изображения из массива hits[]
 * @returns объект с необходимыми(доступными для free) данными
 */
function getImageData(hit) {
  const previewWidth = {
    tiny: 180,
    small: 340,
    middle: 640,
    large: 1280,
  };

  const {
    webformatURL,
    webformatWidth,
    pageURL: homePage,
    // для free версии акка imageURL не приходит(?)
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

  const smallURL = replaceURLWidth(webformatURL, previewWidth.small);
  const middleURL = replaceURLWidth(webformatURL, previewWidth.middle);

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
