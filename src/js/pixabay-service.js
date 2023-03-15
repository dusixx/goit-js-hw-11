import { image, searchParams } from './rest-data';
import axios from 'axios';
import utils from './utils';

const { isInt, isStr, camelToSnake, namesToSnake, parseUrlParams } = utils;
const defOpts = {
  pageIncrement: 1,
};

export default class PixabayService {
  #baseUrl = 'https://pixabay.com/api/';
  #key = '34055483-ceef684195bde25252735e6a5';
  #queryParams;
  #options;
  #response;

  constructor(params, opts) {
    this.queryParams = params;
    this.options = opts;
  }

  /**
   * Формирует строку запроса к серверу, добавляя к baseUrl
   * параметры из #queryParams с именами в snake_case
   */
  #buildQuery(params) {
    // обновляем параметры в кеше
    this.queryParams = params;

    const pstr = Object.entries(this.queryParams).map(
      ([name, value]) => `${name}=${value}`
    );

    return `${this.#baseUrl}?key=${this.#key}${
      pstr.length ? `&${pstr.join('&')}` : ''
    }`;
  }

  /**
   * Делает запрос на сервер с заданными параметрами
   * @param {*} params
   */
  async fetch(params) {
    try {
      // обновляем параметры и делаем запрос на сервер
      const { data, config } = await axios.get(this.#buildQuery(params));

      // обновляем параметры актуальными данными
      this.queryParams = config.url;

      // если задана page, инкрементируем ее, сохраняя текущую
      this.currentPage = this.page;
      this.page += this.options.pageIncrement;

      // кешируем ответ
      this.#response = {
        total: data.total,
        totalHits: data.totalHits,
        hits: data.hits,
        url: config.url,
      };

      return { ...this.#response };
      //
      // error
    } catch (err) {
      // копируем в message более осмысленное сообщение
      // и прокидываем ошибку в пользовательский код
      [err.message, err.message_] = [err.response.data, err.message];
      throw err;
    }
  }

  get baseUrl() {
    return this.#baseUrl;
  }

  /**
   * Вернет объект {param_name: value,...}
   * c именами параметров запроса в snake_case без ключа
   */
  get queryParams() {
    const res = { ...this.#queryParams };
    delete res.key;

    return res;
  }

  /**
   * Обновляет параметры в кеше, при (params === null) - очищает кеш
   * note: Валидации значений не происходит, можно, например, задать {page: 0}
   * @param {*} params - строка|объект параметров или null
   */
  set queryParams(params) {
    let qp = this.#queryParams;

    this.#queryParams =
      params === null
        ? {}
        : isStr(params)
        ? { ...qp, ...parseUrlParams(params) }
        : { ...qp, ...namesToSnake(params) };
  }

  set options(opts) {
    this.#options = { ...defOpts, ...this.#options, ...opts };
  }

  get options() {
    return { ...this.#options };
  }

  // если указан инкремент, возвращает не текущую страницу,
  // а значение после автоинкрементации
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
    const { totalHits, hits } = this.#response;
    return this.page > Math.ceil(totalHits / this.perPage) || !hits.length;
  }
}
