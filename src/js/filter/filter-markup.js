import utils from '../utils/utils';
import refs from '../utils/refs';
import queryParams from '../pb-service/rest-data';

const { filterList } = refs;
const { getRefs, isInt, isFunc, isObj } = utils;

const APPLY_BUTTON_NAME = 'applyFilter';
const APPLY_BUTTON_CAPTION = 'Go';

const CLASS_NAME = {
  filterList: 'filter-list',
  filterListHidden: 'filter-list--hidden',
  filterItem: 'filter-list__item',
  filterItemExpander: 'filter__expander',
  filterItemClear: 'filter__clear',
  filterItemExpanderExpanded: 'filter__expander--expanded',
  filterItemMenu: 'filter__menu',
  filterItemOption: 'filter__option',
  filterItemOptions: 'filter__options',
};

/**
 * Создает разметку для панели фильтров
 */
function makeFilterList() {
  const markup = Object.entries(queryParams).map(makeFilterMenuItem).join('');

  // рендерим разметку
  filterList?.insertAdjacentHTML('beforeend', markup);

  // ставим дефолтные
  filterList.querySelectorAll('[type="checkbox"][checked]').forEach(itm => {
    itm.checked = true;
    itm.removeAttribute('checked');
  });
}

/**
 *
 * @param {*} name
 * @returns
 */
function makeFilterMenuItem([paramName, paramValue]) {
  if (!isObj(paramValue)) return;

  const { type, caption } = paramValue;
  const id = paramName.replaceAll('_', '-');
  const params = { ...paramValue, name: paramName };

  switch (type) {
    case 'number':
    case 'text':
      return `
        <div class="${CLASS_NAME.filterItem}" id="${id}">
          ${makeFilterTextbox(params)}
        </div>`;

    case 'checkbox':
      return `
        <div class="${CLASS_NAME.filterItem}" id="${id}">
          ${makeFilterCheckbox(params)}
        </div>`;

    default:
      return `
        <div class="${CLASS_NAME.filterItem}">
          ${makeFilterExpander(params)}
        </div>`;
  }
}

function makeFilterCheckbox({ name, value = '', caption, checked }) {
  caption = caption || name.replaceAll('_', ' ');

  return `
    <label>
      <input type="checkbox"
        name="${name}" value="${value}"
        ${checked ? 'checked' : ''}
      />
      <span>${caption || name}</span>
    </label>`;
}

function makeFilterTextbox(params) {
  const {
    name,
    value = '',
    caption = name.replaceAll('_', ' '),
    min,
    max,
    type,
    checked,
  } = params;

  return `
    <label>
      <span>${caption || name}</span>
      <input type="${type}" name="${name}" value="${value}"
        ${isInt(min) ? `min="${min}"` : ''}
        ${isInt(max) ? `max="${max}"` : ''}
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
    <button class="${CLASS_NAME.filterItemExpander}" type="button">
        <span class="${CLASS_NAME.filterItemClear}" title="Clear filter"
          >&times;</span>
        ${expanderCaption}
    </button>
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

  // console.log(value);

  const optionsMarkup = value
    .map((val, idx) => {
      let style = '';
      let title = '';
      let id = '';
      const [value, alias] = val.split('?');

      if (colorPalette) {
        title = value;
        id = value;
        style = `background-color: ${alias || value}`;
        defValueIdx = -1;
      }

      return makeFilterMenuOption({
        id,
        name,
        value,
        style,
        title,
        multisel,
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
  const { name, value, caption, title, style, isDefault, id, multisel } =
    params;

  // value ставим даже пустое, иначе будет взято стандартное "on"
  return `
    <li class="${CLASS_NAME.filterItemOption}" ${id ? `id="${id}"` : ''} >
      <label>
        <input type="checkbox"
          name="${name}" value="${value}" 
          ${title ? `title="${title}"` : ''} 
          ${style ? `style="${style}"` : ''} 
          ${isDefault ? 'checked' : ''}
          ${multisel ? 'data-active="false"' : ''}
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
