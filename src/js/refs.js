import utils from './utils';

const searchFormRef = document.querySelector('.search-form');
const { getRef } = utils;

export default {
  searchForm: searchFormRef,
  searchInput: searchFormRef?.searchQuery,
  clearBtn: searchFormRef?.clearBtn,
  loader: getRef('.loader'),
  backtop: getRef('.backtop'),
  gallery: getRef('.gallery'),
  header: getRef('.header'),
  filterMenu: getRef('.filter'),
  toggleFilterMenu: getRef('.toggle-filter'),
};
