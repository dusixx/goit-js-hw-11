import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

defOpts = {
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
   * @returns разметку для карточки изображения
   */
  #makeImageCard(hit) {
    const className = this.#className;
    const iconsPath = new URL('../images/icons.svg', import.meta.url);

    const {
      tags,
      preview,
      width,
      height,
      likes,
      views,
      comments,
      downloads,
      homePage,
    } = getImageData(hit);

    const { small, middle, large } = preview;
    const { addTransparentBg, transparentBgClass } = this.options;

    // NOTE: png не гарантирует прозрачность
    const transpBgClass =
      addTransparentBg && getImageType(hit) === 'png' ? transparentBgClass : '';

    const makeTagsList = tags =>
      tags
        .split(/\s*,\s*/)
        .map(tag => `<li class="img-tag">${tag}</li>`)
        .join('');

    return `
      <li class="${className}__item ${transpBgClass}">
        <a class="${className}__link" href="${large.url}">
          <img class="${className}__img"
            srcset = "${small.url} 1x, ${middle.url} 2x"
            src="${small.url}"
            alt="${tags}"
            loading="lazy">
          </a>

          <div class = "img-overlay-upper">
            <ul class="img-tags">${makeTagsList(tags)}</ul>
          </div>
          
          <div class="img-overlay">
            <ul class="img-info">
              <li class="img-info__item" title="Likes">
                <a href="${homePage}" target="_blank" rel="noopener noreferrer">
                  <svg><use href="${iconsPath}#icon-heart"></use></svg>
                  ${likes}
                </a>
              </li>
              <li class="img-info__item" title="Comments">
                <a href="${homePage}" target="_blank" rel="noopener noreferrer">
                  <svg><use href="${iconsPath}#icon-bubble"></use></svg>
                  ${comments}
                </a>
              </li>
              <li class="img-info__item" title="Views">
                <a href="${homePage}" target="_blank" rel="noopener noreferrer">
                  <svg><use href="${iconsPath}#icon-eye"></use></svg>
                  ${views}
                </a>
              </li>
              <li class="img-info__item" title="Downloads">
                <a href="${homePage}" target="_blank" rel="noopener noreferrer">
                  <svg><use href="${iconsPath}#icon-download"></use></svg>
                  ${downloads}
                </a>
             </li>
            </ul>
          </div>
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
