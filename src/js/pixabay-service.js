import { image, searchParams } from './rest-data';
import axios from 'axios';
import utils from './utils';

const { isInt, isStr, camelToSnake, namesToSnake, parseUrlParams } = utils;

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
   * Формирует строку запроса к серверу, добавляя к baseUrl
   * параметры из #queryParams с именами в snake_case
   */
  buildQuery(params) {
    // обновляем параметры в кеше
    this.queryParams = params;

    const pstr = Object.entries(this.queryParams).map(
      ([name, value]) => `${name}=${value}`
    );

    return encodeURI(
      `${this.#baseUrl}?key=${this.#apiKey}${
        pstr.length ? `&${pstr.join('&')}` : ``
      }`
    );
  }

  /**
   * Делает запрос на сервер с заданными параметрами
   * @param {*} params
   */
  async fetch(params) {
    try {
      // обновляем параметры и делаем запрос на сервер
      const resp = await axios.get(this.buildQuery(params));

      // обновляем параметры актуальными данными
      // Декодируем, иначе, если запрос закодирован -
      // при следующем вызове buildQuery() он будет кодироваться снова.
      // Будет происходить "обфускация" и увеличение длинны строки вплоть до лимита
      this.queryParams = decodeURI(resp.config.url);

      // если задана page, инкрементируем ее, сохраняя текущую
      this.currentPage = this.page;
      this.page += this.options.pageIncrement;

      // можно будет проверять response.ok
      resp.ok = true;

      // console.log(resp);

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
   * Валидации значений не происходит, допускается { page: 0, ... }
   * Можно задать объект валидации { paramName: validator = () => {...} }
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

  get baseUrl() {
    return this.#baseUrl;
  }

  /**
   * Последний ответ от сервера,
   * в случае ошибки - вернет ее объект
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
   * Если был задан инкремент (!== 0),
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
    // в случае неудачного fetch response.data === undefined
    // И вернет true(this.page > NaN || !undefined)
    const { totalHits, hits } = this.#response.data || '';
    return this.page > Math.ceil(totalHits / this.perPage) || !hits?.length;
  }
}
