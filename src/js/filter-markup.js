import utils from './utils';
import refs from './refs';

const { filterList, body } = refs;
const { getRefs, isInt } = utils;

const APPLY_BUTTON_NAME = 'applyFilter';
const CLASS_NAME = {
  filterList: 'filter-list',
  filterListHidden: 'filter-list--hidden',
  filterItem: 'filter',
  filterItemExpander: 'filter__expander',
  filterItemExpanderExpanded: 'filter__expander--expanded',
  filterItemMenu: 'filter__menu',
  filterItemOption: 'filter__option',
  filterItemOptions: 'filter__options',
};

/**
 * @param {object} queryParams данные о параметрах REST API
 */
function makeFilterList(filterList, queryParams) {
  const markup = Object.entries(queryParams)
    .map(([name, params]) => {
      return `
        <div class="${CLASS_NAME.filterItem}">
          ${getFilterItemMarkup({ name, ...params })}
        </div>`;
    })
    .join('');

  // рендерим разметку
  filterList?.insertAdjacentHTML('afterbegin', markup);
}

/**
 * @param {object} params
 * @returns разметка для фильтра
 */
function getFilterItemMarkup(params) {
  const itemMenuMarkup = getFilterItemMenuMarkup(params);
  let { nodeType, name, caption, value, multiselect } = params;

  if (isInt(caption)) {
    const [val, alias] = value[caption].split('?');
    caption = alias || val;
  }

  switch (nodeType) {
    case 'checkbox':
      return `
        <label>
          <input type="checkbox" name=${name} value=${value}>
          <span>${caption || name}</span>
        </label>`;

    default: /* button */
      return `
        <button
          class="${CLASS_NAME.filterItemExpander}" 
          type="button" ><span title="Clear filter">&times;</span>
            ${caption || name}</button>
        ${itemMenuMarkup}`;
  }
}

/**
 * @param {array} value - массив значений параметра
 * @returns разметка ul-списка опций фильтра
 */
function getFilterItemMenuMarkup({ name, value, multiselect, isColorPalette }) {
  const applyBtn = multiselect
    ? `<button type="button" name="${APPLY_BUTTON_NAME}">Go</button>`
    : '';

  const itemOptionsMarkup = value
    .map(v => {
      const [value, alias] = v.split('?');
      const caption = isColorPalette ? value : alias || value;

      const style = isColorPalette
        ? `style="background-color: ${alias || value}"`
        : '';

      return `
        <li class="${CLASS_NAME.filterItemOption}">
          <label>
            <input type="checkbox" 
              name="${name}" 
              value="${value}"
              title="${caption}"
              ${style} >
            <span>${caption}</span>
          </label>
        </li>`;
    })
    .join('');

  return `
    <div class="${CLASS_NAME.filterItemMenu}">
      <ul class="${CLASS_NAME.filterItemOptions}"
        name="${name}" ${multiselect && 'multiselect'}
      >${itemOptionsMarkup}</ul>
      ${applyBtn}
    </div>`;
}

export default {
  CLASS_NAME,
  APPLY_BUTTON_NAME,
  makeFilterList,
};
