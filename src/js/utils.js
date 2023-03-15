import { Notify } from 'notiflix';
import throttle from 'lodash.throttle';
import simpleLightbox from 'simplelightbox';

// чтобы не перекрывало кнопки
Notify.init({ position: 'right-bottom' });

const defNotifyTimeout = 3000;

const isDef = v => typeof v !== 'undefined';
const isStr = v => typeof v === 'string';
const isFunc = v => typeof v === 'function';
const isInt = v => Number.isInteger(v);
const isNum = v => !isNaN(v - parseFloat(v));
const isObj = v => Object.prototype.toString.call(v) === '[object Object]';
const normId = id => `${id}`.replace(/[^$\w]/gi, '').replace(/^\d+/, '');

//
// ID name
//

function snakeToCamel(v) {
  return normId(v.replace(/^_+|_+$/g, ''))
    .replace(/_+(\w)/g, (_, ch) => ch.toUpperCase())
    .replace(/^./, m => m.toLowerCase());
}

function camelToSnake(v) {
  return normId(v)
    .replace(/(?<=[^A-Z])([A-Z])/g, (_, ch) => `_${ch.toLowerCase()}`)
    .replace(/_+/g, '_');
}

function namesToSnake(obj = {}) {
  return Object.entries(obj).reduce((res, [name, value]) => {
    res[camelToSnake(name)] = value;
    return res;
  }, {});
}

/**
 * @param {string} v -> ...name1=value1&name2=value2...
 * @return {object} { name1: value1,...}
 */
function parseUrlParams(str) {
  if (!str || !isStr(str)) return [];

  let res = str.split('?');
  res = (res[1] || res[0]).split('&');

  return res.reduce((obj, itm) => {
    const [name, value = ''] = itm.split('=');
    obj[name] = isNum(value) ? Number(value) : value;

    return obj;
  }, {});
}

/**
 * @returns текущий клиентский размер вьюпорта
 */
function getViewportClientRect() {
  const doc = document.documentElement;

  return {
    height: doc.clientHeight,
    width: doc.clientWidth,
    top: doc.clientTop,
    left: doc.clientLeft,
  };
}

//
// Notify
//

function error(msg, opts) {
  Notify.failure(msg, { timeout: defNotifyTimeout, ...opts });
}

function info(msg, opts) {
  Notify.info(msg, { timeout: defNotifyTimeout, ...opts });
}

function succ(msg, opts) {
  Notify.success(msg, { timeout: defNotifyTimeout, ...opts });
}

export default {
  isDef,
  isStr,
  isFunc,
  isInt,
  isObj,
  isNum,
  error,
  info,
  succ,
  normId,
  snakeToCamel,
  camelToSnake,
  namesToSnake,
  parseUrlParams,
  throttle,
  getViewportClientRect,
};
