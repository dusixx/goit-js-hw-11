import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';

const { filterList } = refs;
const { getRefs, isInt, isFunc, isObj } = utils;

const APPLY_BUTTON_NAME = 'applyFilter';
const APPLY_BUTTON_CAPTION = 'Go';

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
 *
 */
function makeFilterList() {
  const markup = Object.entries(queryParams).map(makeFilterMenuItem).join('');

  // рендерим разметку
  filterList?.insertAdjacentHTML('beforeend', markup);

  // ставим дефолтные
  filterList
    .querySelectorAll('[type="checkbox"][default]')
    .forEach(itm => (itm.checked = true));
}

/**
 *
 * @param {*} name
 * @returns
 */
function makeFilterMenuItem([paramName, paramValue]) {
  if (!isObj(paramValue)) return;

  const { type, caption } = paramValue;
  const params = {
    ...paramValue,
    name: paramName,
    caption: caption || paramName.replaceAll('_', ' '),
  };

  switch (type) {
    case 'number':
      return `
        <div class="${CLASS_NAME.filterItem}">
          ${makeFilterTextbox(params)}
        </div>`;

    case 'checkbox':
      return `
        <div class="${CLASS_NAME.filterItem}">
          ${makeFilterCheckbox(params)}
        </div>`;

    default:
      return `
        <div class="${CLASS_NAME.filterItem}">
          ${makeFilterExpander(params)}
        </div>`;
  }
}

function makeFilterCheckbox({ name, value, caption, checked }) {
  return `
    <label>
      <input type="checkbox"
        name="${name}" value="${value}"
        ${checked ? 'default' : ''}
      />
      <span>${caption || name}</span>
    </label>`;
}

function makeFilterTextbox({ name, value, caption, checked }) {
  return `
    <label>
      <span>${caption || name}</span>
      <input type="number"
        name="${name}" value="${value}"
        ${checked ? 'default' : ''}
      />
    </label>`;
}

/**
 *
 * @param {*} name
 * @returns
 */
function makeFilterExpander(params) {
  let { name, value, caption, defValueIdx } = params;

  if (!isInt(defValueIdx)) defValueIdx = 0;

  const [defValue, defAlias] = value[defValueIdx].split('?');
  const expanderCaption = caption || defAlias || defValue;

  return `
    <button
      class="${CLASS_NAME.filterItemExpander}" 
      type="button" ><span title="Clear filter">&times;</span>
        ${expanderCaption}</button>
    ${makeFilterExpanderMenu({ ...params, name, defValueIdx })}`;
}

/**
 *
 * @param {*} params
 */
function makeFilterExpanderMenu(params) {
  let { name, value, defValueIdx, multiselect, colorPalette } = params;

  const multisel = multiselect || colorPalette ? 'multiselect' : '';

  const applyBtn = multisel
    ? `<button type="button" name="${APPLY_BUTTON_NAME}">
        ${APPLY_BUTTON_CAPTION}
      </button>`
    : '';

  console.log(value);

  const optionsMarkup = value
    .map((val, idx) => {
      let style = '';
      let title = '';
      const [value, alias] = val.split('?');

      if (colorPalette) {
        title = value;
        style = `background-color: ${alias || value}`;
        defValueIdx = -1;
      }

      return makeFilterMenuOption({
        name,
        value,
        style,
        title,
        caption: alias || value,
        isDefault: idx === defValueIdx,
      });
    })
    .join('');

  return `
    <div class="${CLASS_NAME.filterItemMenu}">
      <ul class="${CLASS_NAME.filterItemOptions}"
        name="${name}" ${multisel}
      >${optionsMarkup}</ul>
      ${applyBtn}
    </div>`;
}

/**
 *
 * @param {*} params
 * @returns
 */
function makeFilterMenuOption(params) {
  const { name, value, caption, title, style, isDefault } = params;

  // value ставим даже пустое, иначе будет взято стандартное "on"
  return `
    <li class="${CLASS_NAME.filterItemOption}">
      <label>
        <input type="checkbox"
          name="${name}" value="${value}" 
          ${title ? `title="${title}"` : ''} 
          ${style ? `style="${style}"` : ''} 
          ${isDefault ? 'default' : ''}
        />
        <span>${caption}</span>
      </label>
    </li>`;
}

export default {
  CLASS_NAME,
  APPLY_BUTTON_NAME,
  makeFilterList,
};
