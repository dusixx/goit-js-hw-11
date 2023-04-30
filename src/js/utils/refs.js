import utils from './utils';

const { getRef } = utils;
const searchFormRef = getRef('.search-form');

export default {
  body: document.documentElement,
  searchForm: searchFormRef,
  searchInput: searchFormRef?.searchQuery,
  clearBtn: searchFormRef?.clearBtn,
  loader: getRef('.loader'),
  backtop: getRef('.backtop'),
  gallery: getRef('.gallery'),
  header: getRef('.header'),
  filterList: getRef('.filter-list'),
  toggleFilterList: getRef('.toggle-filter-list'),
};
