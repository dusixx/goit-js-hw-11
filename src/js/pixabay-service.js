import { image, searchParams } from './rest-data';
import axios from 'axios';
import utils from './utils';

const { isInt, isStr } = utils;
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

  #increasePage() {
    const inc = this.#options.pageIncrement;
    this.page += isInt(inc) ? inc : defOpts.pageIncrement;
  }

  /**
   *
   * Формирует строку запроса к серверу, добавляя к baseUrl
   * параметры из #queryParams с именами в snake_case
   */
  #buildQuery(params) {
    // обновляем параметры в кеше
    this.queryParams = params;
    const qp = this.queryParams;

    const pstr = Object.keys(qp).map(
      name => `${utils.camelToSnake(name)}=${qp[name]}`
    );

    return `${this.#baseUrl}?key=${this.#key}${
      pstr.length ? `&${pstr.join('&')}` : ''
    }`;
  }

  /**
   *
   * Делает запрос на сервер с заданными параметрами
   * @param {*} params
   */
  async fetch(params) {
    // обновляем параметры и делаем запрос на сервер
    const { data, config } = await axios.get(this.#buildQuery(params));

    // обновляем параметры актуальными данными
    this.queryParams = config.url;

    // если задана page, инкрементируем ее
    this.#increasePage();

    // кешируем ответ
    this.#response = {
      total: data.total,
      totalHits: data.totalHits,
      hits: data.hits,
      url: config.url,
    };

    return { ...this.#response };
  }

  get baseUrl() {
    return this.#baseUrl;
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
   * Обновляет параметры в кеше, при (params === null) - очищает кеш
   * @param {*} params - строка|объект параметров или null
   */
  set queryParams(params) {
    let qp = this.#queryParams;

    this.#queryParams =
      params === null
        ? {}
        : isStr(params)
        ? { ...qp, ...utils.parseUrlParams(params) }
        : { ...qp, ...utils.namesToSnake(params) };
  }

  set options(opts) {
    this.#options = { ...defOpts, ...this.#options, ...opts };
  }

  get options() {
    return { ...this.#options };
  }

  get page() {
    return this.#queryParams.page;
  }

  set page(v) {
    if (isInt(v)) this.#queryParams.page = v;
  }

  get isEOSReached() {
    return (
      this.page >
      Math.ceil(this.#response.totalHits / this.#queryParams['per_page'])
    );
  }
}
