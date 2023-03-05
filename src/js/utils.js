import { Notify } from 'notiflix';
import simpleLightbox from 'simplelightbox';

const isDef = v => typeof v !== 'undefined';
const isStr = v => typeof v === 'string';
const isFunc = v => typeof v === 'function';
const isInt = v => Number.isInteger(v);
const normId = id => `${id}`.replace(/[^$\w]/gi, '').replace(/^\d+/, '');

export default {
  isStr,
  isDef,
  isFunc,
  isInt,
  normId,

  snakeToCamelCase(v) {
    return normId(v.replace(/^_+|_+$/g, ''))
      .replace(/_+(\w)/g, (_, ch) => ch.toUpperCase())
      .replace(/^./, m => m.toLowerCase());
  },

  camelToSnakeCase(v) {
    return normId(v)
      .replace(/(?<=[^A-Z])([A-Z])/g, (_, ch) => `_${ch.toLowerCase()}`)
      .replace(/_+/g, '_');
  },

  error(msg, timeout = 1500) {
    Notify.failure(msg, { timeout, showOnlyTheLastOne: true });
  },

  info(msg, timeout = 1500) {
    Notify.info(msg, { timeout, showOnlyTheLastOne: true });
  },
};
