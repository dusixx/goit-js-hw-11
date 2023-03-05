import { image, searchParams } from './rest-data';
import axios from 'axios';
import utils from './utils';

const API_KEY = '34055483-ceef684195bde25252735e6a5';

const apiData = {
  baseUrl: 'https://pixabay.com/api/',
  searchParams,
  image,
};

const defOpts = {
  pageIncrementValue: 1,
};

/////////////////////////
// Pixabay API service
/////////////////////////

export class PixabayService {
  static data = apiData;
  #queryData;

  constructor(searchParams, opts = defOpts) {
    this.options = opts;
    // добавляем корректные имена параметров в качестве свойств
    // для валидации поисковых запросов на клиенте
    this.clearQueryData().#updateQueryData(searchParams);
  }

  // если параметр не задан явно в запросе или задан некорректно,
  // сервер возьмет значение по-умолчанию (page = 1, image_type = "all"...)
  clearQueryData() {
    this.#queryData = {};

    apiData.searchParams.forEach(name => {
      name = utils.snakeToCamelCase(name);
      this.#queryData[name] = null;
    });

    return this;
  }

  #updateQueryData(params = {}, callback) {
    const cb = utils.isFunc(callback) ? callback : null;
    let value;

    for (const name of Object.keys(this.#queryData)) {
      // обновляем значение параметра в кеше, если имя валидно
      if (params.hasOwnProperty(name)) this.#queryData[name] = params[name];

      // "нулевые"(null | undefined) параметры игнорируем
      value = this.#queryData[name];
      if (value != null && cb) cb(name, value);
    }
  }

  #buildQueryString(params) {
    const pstr = [];

    this.#updateQueryData(params, (name, value) =>
      // формируем строку параметров запроса
      pstr.push(`${utils.camelToSnakeCase(name)}=${value}`)
    );

    return encodeURI(
      `${apiData.baseUrl}?key=${API_KEY}${
        pstr.length ? `&${pstr.join('&')}` : ''
      }`
    );
  }

  async fetch(params) {
    const { data, config } = await axios.get(this.#buildQueryString(params));

    // если успешно получили данные
    this.page += 1; //this.options?.pageIncrementValue;

    return {
      total: data.total,
      totalHits: data.totalHits,
      hits: data.hits,
      url: config.url,
    };
  }

  get page() {
    if (!utils.isInt(this.#queryData.page)) this.#queryData.page = 1;
    return this.#queryData.page;
  }

  set page(v) {
    if (utils.isInt(v)) this.#queryData.page = v;
  }
}
