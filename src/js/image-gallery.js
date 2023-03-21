import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

defOpts = {
  addTransparentBg: true,
  transparentBgClass: 'transparent-bg',
};

export default class ImageGallery {
  #ref;
  #options;
  #simpleLightBox;

  /**
   * @param {string} classSelector
   * @param {object} opts - объект опций
   */
  constructor(classSelector, opts) {
    this.#ref = document.querySelector(classSelector);

    const { nodeName } = this.#ref || '';

    if (nodeName !== 'UL' && nodeName !== 'DIV') {
      throw new Error('Invalid gallery element');
    }

    this.options = opts;

    // инициализируем simpleLightbox
    this.#simpleLightBox = new SimpleLightbox(`${classSelector} a`, {
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
   * @returns разметку для одной карточки изображения
   */
  #makeImageCard(hit) {
    const { className } = this.ref;
    const { tags, preview, width, height } = getImageData(hit);
    const { small, middle, large } = preview;
    const { addTransparentBg, transparentBgClass } = this.options;

    // NOTE: png не гарантирует прозрачность
    const transpBgClass =
      addTransparentBg && getImageType(hit) === 'png' ? transparentBgClass : '';

    return `
      <li class="${className}__item ${transpBgClass}">
        <a href="${large.url}">
          <img class="${className}__img"
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

    const lastImage = this.ref.lastElementChild?.querySelector('img');
    // учитывая lazy, подгрузится при скроле
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

//
// Helpers
//

/**
 * @param {object} hit
 * @returns расширение файла изображения
 */
function getImageType(hit) {
  return hit.largeImageURL.match(/[^\.]+$/)[0].toLowerCase();
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

function replaceURLWidth(url, width) {
  return url.replace(/(_\d+)(?=\.\w+$)/, `_${width}`);
}

/**
 * @param {object} hit - данные изображения из hits[]
 * @returns объект с необходимыми(доступными для free) данными
 */
function getImageData(hit) {
  const PREVIEW_WIDTH = {
    tiny: 180,
    small: 340,
    middle: 640,
    large: 1280,
  };

  const smallURL = replaceURLWidth(hit.webformatURL, PREVIEW_WIDTH.small);
  const middleURL = replaceURLWidth(hit.webformatURL, PREVIEW_WIDTH.middle);

  return {
    preview: {
      normal: { url: hit.webformatURL, width: hit.webformatWidth },
      small: { url: smallURL, width: PREVIEW_WIDTH.small },
      middle: { url: middleURL, width: PREVIEW_WIDTH.middle },
      large: { url: hit.largeImageURL, width: PREVIEW_WIDTH.large },
    },
    width: hit.imageWidth,
    height: hit.imageHeight,
    size: hit.imageSize,
    homePage: hit.pageURL,
    tags: hit.tags,
    views: hit.views,
    downloads: hit.downloads,
    likes: hit.likes,
    comments: hit.comments,
  };
}
