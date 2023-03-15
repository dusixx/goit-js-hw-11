const searchFormRef = document.querySelector('.search-form');

export default {
  searchForm: searchFormRef,
  searchInput: searchFormRef.searchQuery,
  clearBtn: searchFormRef.clearBtn,
  loader: document.querySelector('.loader'),
  backtop: document.querySelector('.backtop'),
};
