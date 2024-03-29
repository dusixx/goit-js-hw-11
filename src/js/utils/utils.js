import { Notify } from 'notiflix';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import FileSaver from 'file-saver';

const isDef = v => typeof v !== 'undefined';
const isStr = v => typeof v === 'string';
const isFunc = v => typeof v === 'function';
const isInt = v => Number.isInteger(v);
const isNum = v => !isNaN(v - parseFloat(v));
const isObj = v => Object.prototype.toString.call(v) === '[object Object]';

const normId = id => `${id}`.replace(/[^$\w]/gi, '').replace(/^\d+/, '');
const getTypeName = v => Object.prototype.toString.call(v).match(/(\S+)\]$/)[1];

const getRef = document.querySelector.bind(document);
const getRefs = document.querySelectorAll.bind(document);

//
// Numeric
//

function fitIntoRange({ value, min, max }) {
  if (!isNum(value)) return NaN;

  if (!isNum(min)) min = -Infinity;
  if (!isNum(max)) max = Infinity;

  return Math.max(min, Math.min(max, value));
}

function formatNumber(v) {
  if (!isNum(v)) return '';
  const digits = String(v).length;

  if (digits >= 7) return `${(v / 10 ** 6).toFixed(1)}M`;
  if (digits >= 4) return `${(v / 10 ** 3).toFixed(1)}K`;

  return String(v);
}

//
// String
//

function snakeToCamel(str) {
  return normId(str.replace(/^_+|_+$/g, ''))
    .replace(/_+(\w)/g, (_, ch) => ch.toUpperCase())
    .replace(/^./, m => m.toLowerCase());
}

function camelToSnake(str) {
  return normId(str)
    .replace(/(?<=[^A-Z])([A-Z])/g, (_, ch) => `_${ch.toLowerCase()}`)
    .replace(/_+/g, '_');
}

function getFileType(str) {
  return String(str)
    .match(/[^\.]+$/)[0]
    .toLowerCase();
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
// Scroll
//

function scrollByTop(top, behavior = 'smooth') {
  scrollBy({
    top,
    behavior,
  });
}

function scrollToTop(top, behavior = 'smooth') {
  scrollTo({
    top,
    behavior,
  });
}

//
// Notify
//

// чтобы не перекрывало кнопки
Notify.init({ position: 'right-bottom' });

const defNotifyOpts = {
  timeout: 3000,
};

function error(msg, opts) {
  Notify.failure(msg, { ...defNotifyOpts, ...opts });
}

function info(msg, opts) {
  Notify.info(msg, { ...defNotifyOpts, ...opts });
}

function succ(msg, opts) {
  Notify.success(msg, { ...defNotifyOpts, ...opts });
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
  getRef,
  getRefs,
  getTypeName,
  fitIntoRange,
  snakeToCamel,
  camelToSnake,
  scrollByTop,
  scrollToTop,
  throttle,
  debounce,
  formatNumber,
  getFileType,
  saveFileAs: FileSaver.saveAs,
  getViewportClientRect,
};
