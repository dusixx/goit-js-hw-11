import axios from 'axios';
import utils from '../utils/utils';

const { isInt, isObj, isStr, camelToSnake } = utils;

const defOpts = {
  pageIncrement: 1,
  throwFetchErrors: true,
};

export default class PixabayService {
  #baseUrl = 'https://pixabay.com/api/';
  #apiKey = '34055483-ceef684195bde25252735e6a5';
  #queryParams;
  #options;
  #response;

  constructor(params, opts) {
    this.queryParams = params;
    this.options = opts;
  }

  /**
   *
   * Формирует строку запроса к серверу, добавляя к baseUrl
   * параметры из #queryParams с именами в snake_case
   */
  buildQuery(params) {
    // обновляем параметры
    if (params) this.queryParams = params;

    return `${this.#baseUrl}?key=${this.#apiKey}&${new URLSearchParams(
      this.#queryParams
    )}`;
  }

  /**
   *
   * Делает запрос на сервер с заданными параметрами
   * @param {*} params
   */
  async fetch(params) {
    try {
      // обновляем параметры и делаем запрос на сервер
      const resp = await axios.get(this.buildQuery(params));

      resp.ok = true;

      // если задана page, инкрементируем ее, сохраняя текущую
      this.currentPage = this.page;
      this.page += this.options.pageIncrement;

      console.log(resp, typeof resp);

      return { ...(this.#response = resp) };

      // error
    } catch (err) {
      this.#response = err;

      // копируем в message более осмысленное сообщение
      [err.message, err.message_] = [err.response.data, err.message];

      // если не прокидывать ошибку, надо анализировать response.ok
      if (this.options.throwFetchErrors) throw err;
    }
  }

  /**
   *
   * Вернет объект {param_name: value,...}
   * c именами параметров запроса в snake_case без ключа
   */
  get queryParams() {
    const res = { ...this.#queryParams };
    delete res.key;

    return res;
  }

  /**
   *
   * Валидации значений не происходит, допускается { page: 0, ... }
   * Можно задать объект валидации { paramName: validator = () => {...} }
   * @param {*} params - объект параметров или null
   */
  set queryParams(params) {
    if (params === null) this.#queryParams = {};
    else if (isObj(params)) this.#queryParams = namesToSnake(params);
  }

  get baseUrl() {
    return this.#baseUrl;
  }

  /**
   *
   * Последний ответ от сервера или объект ошибки
   */
  get response() {
    return { ...this.#response };
  }

  set options(opts) {
    this.#options = { ...defOpts, ...this.#options, ...opts };
  }

  get options() {
    return { ...this.#options };
  }

  /**
   *
   * Если был задан инкремент(!=0) в опциях -
   * возвращает страницу после инкрементации
   */
  get page() {
    return this.#queryParams.page;
  }

  set page(v) {
    if (isInt(v)) this.#queryParams.page = v;
  }

  get perPage() {
    return this.#queryParams['per_page'];
  }

  set perPage(v) {
    if (isInt(v)) this.#queryParams['per_page'] = v;
  }

  get isEOSReached() {
    // В случае неудачного fetch (response.data === undefined)
    // вернет true -> (this.page > NaN || !undefined)
    const { totalHits, hits } = this.#response.data || '';
    return this.page > Math.ceil(totalHits / this.perPage) || !hits?.length;
  }
}

/**
 * @param {object} obj
 * @returns - копию obj с именами свойств в snake_case
 */
function namesToSnake(obj = {}) {
  return Object.entries(obj).reduce((res, [name, value]) => {
    res[camelToSnake(name)] = value;
    return res;
  }, {});
}

/**
 * @param {object} hit - данные изображения из hits[]
 * @returns объект с необходимыми(доступными для free) данными
 */
export function getImageData(hit) {
  const PREVIEW_WIDTH = {
    tiny: 180,
    small: 340,
    middle: 640,
    large: 1280,
  };

  const getImageFilename = previewURL =>
    previewURL.match(/[^\/]+$/)[0].replace(/_\d+/, '');

  const replaceURLWidth = (url, width) =>
    url.replace(/(_\d+)(?=\.\w+$)/, `_${width}`);

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
    fileName: getImageFilename(hit.previewURL),
  };
}
