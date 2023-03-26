import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';
import filterMarkup from './filter-markup';

const { getRef } = utils;
const { filterList, toggleFilterList } = refs;
const { makeFilterList, CLASS_NAME } = filterMarkup;

export default class MediaFilter {
  constructor() {
    // создаем панель фильтров
    makeFilterList(filterList, queryParams);
  }

  show() {
    filterList.classList.toggle(CLASS_NAME.filterListHidden);
  }
}

//
// Event handlers
//

toggleFilterList.addEventListener('click', () =>
  filterList.classList.toggle(CLASS_NAME.filterListHidden)
);

// filterList.addEventListener('click', handleFilterListClick);

// function handleFilterListClick({ target }) {
//   const { classList } = target;
//   const filterMenu = target.nextElementSibling;

//   // button.filter__expander
//   if (classList.contains(CLASS_NAME.filterItemExpander)) {
//     const res = classList.toggle(CLASS_NAME.filterItemExpanderExpanded);
//     filterMenu.classList.toggle(CLASS_NAME.filterItemMenuHidden);
//   }
// }
