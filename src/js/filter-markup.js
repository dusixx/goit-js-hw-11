// !!! надо переписать втупую под каждый параметр без типов и прочей "гибкости"

// import utils from './utils';
import refs from './refs';

const { filterList } = refs;
// const { getRefs, isInt } = utils;

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

  // ставим дефолтные
  filterList
    .querySelectorAll('[type="checkbox"][default]')
    .forEach(itm => (itm.checked = true));
}

/**
 * @param {object} params
 * @returns разметка для фильтра
 */
function getFilterItemMarkup(params) {
  const { nodeType, name, defValue, value, multiselect, caption } = params;

  const defIdx = value[defValue] ? defValue : 0;
  const [val, alias] = value[defIdx].split('?');
  const captionBtn = caption || (multiselect ? name : alias || val || name);

  switch (nodeType) {
    case 'checkbox':
      return `
        <label>
          <input type="checkbox" name="${name}" value="${value}">
          <span>${caption || name}</span>
        </label>`;

    case 'text':
      return `
        <span>${caption || name}</span>
        <input type="text" name="${name}" required>`;

    default: /* button */
      return `
        <button
          class="${CLASS_NAME.filterItemExpander}" 
          type="button" ><span title="Clear filter">&times;</span>
            ${captionBtn}</button>
        ${getFilterItemMenuMarkup({ ...params, defValue: defIdx })}`;
  }
}

/**
 * @param {array} value - массив значений параметра
 * @returns разметка ul-списка опций фильтра
 */
function getFilterItemMenuMarkup(params) {
  const { name, value, multiselect, isColorPalette, defValue } = params;

  const applyBtn = multiselect
    ? `<button type="button" name="${APPLY_BUTTON_NAME}">Go</button>`
    : '';

  const itemOptionsMarkup = value
    .map((itm, idx) => {
      const [value, alias] = itm.split('?');
      const caption = isColorPalette ? value : alias || value;
      const title = isColorPalette ? `title="${caption}"` : '';
      const def = !multiselect && idx === defValue ? 'default' : '';

      const style = isColorPalette
        ? `style="background-color: ${alias || value}"`
        : '';

      return `
        <li class="${CLASS_NAME.filterItemOption}">
          <label>
            <input type="checkbox" name="${name}" 
              value="${value}" ${title} ${style} ${def}>
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
