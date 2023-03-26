import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';
import filterMarkup from './filter-markup';

const { getRef, getRefs } = utils;
const { filterList, toggleFilterList } = refs;
const { makeFilterList, CLASS_NAME } = filterMarkup;

//
// inerface
//
// export default class MediaFilter {
//   constructor() {
//     makeFilterList(filterList, queryParams);
//   }
// }

makeFilterList(filterList, queryParams);

function checkOneOnly(checkbox) {
  console.log(checkbox);
}

// после makeFilterList()
// const filterMenuOptions = getRef(`.${CLASS_NAME.filterItemOptions}`);
// console.log(filterMenuOptions);

//
// Event handlers
//

toggleFilterList.addEventListener('click', () =>
  filterList.classList.toggle(CLASS_NAME.filterListHidden)
);

filterList.addEventListener('click', handleFilterListClick);

function handleFilterListClick({ target }) {
  const { classList } = target;

  // button.filter__expander
  if (classList.contains(CLASS_NAME.filterItemExpander)) {
    const res = classList.toggle(CLASS_NAME.filterItemExpanderExpanded);
  }
}

// console.log(getRefs(CLASS_NAME.filterItemOptions));

// function handleFilterOptionsClick(e) {
//   console.log(e);
// }

filterList.addEventListener('click', handleOptionClick, true);

function handleOptionClick(e) {
  const { currentTarget, target } = e;

  // console.log(target);

  // менеям стандартное поведение на radio
  if (target.classList.contains(CLASS_NAME.filterItemOption)) {
    const checkbox = target.firstElementChild.firstElementChild;
    const checkboxes = target.parentNode.querySelectorAll(
      'input[type="checkbox"]'
    );

    console.log(checkboxes);

    checkboxes.forEach(itm => (itm.checked = false));
    checkbox.checked = true;
  }
}
