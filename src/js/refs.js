const searchFormRef = document.querySelector('.search-form');
const getRef = document.querySelector.bind(document);

export default {
  searchForm: searchFormRef,
  searchInput: searchFormRef?.searchQuery,
  clearBtn: searchFormRef?.clearBtn,
  loader: getRef('.loader'),
  backtop: getRef('.backtop'),
  gallery: getRef('.gallery'),
  header: getRef('.header'),
  filterPanel: getRef('.filter'),
  filterMenu: getRef('.filter-menu'),
  toggleFilterPanel: getRef('.toggle-filter'),
  filterMenuControls: getRef('.filter-menu__controls'),
  applyFilter: getRef('.filter-menu [type="submit"]'),
};
