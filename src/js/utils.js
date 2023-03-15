import { Notify } from 'notiflix';
import simpleLightbox from 'simplelightbox';

const defNotifyTimeout = 1500;

const isDef = v => typeof v !== 'undefined';
const isStr = v => typeof v === 'string';
const isFunc = v => typeof v === 'function';
const isInt = v => Number.isInteger(v);
const isObj = v => Object.prototype.toString.call(v) === '[object Object]';
const isNum = v => !isNaN(v - parseFloat(v));
const normId = id => `${id}`.replace(/[^$\w]/gi, '').replace(/^\d+/, '');

export default {
  isDef,
  isStr,
  isFunc,
  isInt,
  isObj,
  isNum,
  normId,

  snakeToCamel(v) {
    return normId(v.replace(/^_+|_+$/g, ''))
      .replace(/_+(\w)/g, (_, ch) => ch.toUpperCase())
      .replace(/^./, m => m.toLowerCase());
  },

  camelToSnake(v) {
    return normId(v)
      .replace(/(?<=[^A-Z])([A-Z])/g, (_, ch) => `_${ch.toLowerCase()}`)
      .replace(/_+/g, '_');
  },

  error(msg, opts) {
    Notify.failure(msg, { timeout: defNotifyTimeout, ...opts });
  },

  info(msg, opts) {
    Notify.info(msg, { timeout: defNotifyTimeout, ...opts });
  },

  warn(msg, opts) {
    Notify.warning(msg, { timeout: defNotifyTimeout, ...opts });
  },

  succ(msg, opts) {
    Notify.success(msg, { timeout: defNotifyTimeout, ...opts });
  },

  namesToSnake(obj = {}) {
    return Object.entries(obj).reduce((res, [name, value]) => {
      res[this.camelToSnake(name)] = value;
      return res;
    }, {});
  },

  /**
   * @param {number} top
   * @param {number} delay
   */
  scrollTop(top, { behavior = 'smooth', delay } = {}) {
    if (isInt(delay)) {
      return setTimeout(scrollTop, delay, top, { behavior });
    }

    window.scrollBy({
      top,
      behavior: behavior,
    });
  },

  getViewportClientRect() {
    const doc = document.documentElement;

    return {
      height: doc.clientHeight,
      width: doc.clientWidth,
      top: doc.clientTop,
      left: doc.clientLeft,
    };
  },

  /**
   *
   * @param {string} url -> ...name1=value1&name2=value2...
   * @return {object} { name1: value1,...}
   */
  parseUrlParams(url) {
    const res = String(url).split('?')[1]?.split('&') || [];

    return res.reduce((obj, itm) => {
      const [name, value] = itm.split('=');
      obj[name] = isNum(value) ? +value : value;

      return obj;
    }, {});
  },
};
