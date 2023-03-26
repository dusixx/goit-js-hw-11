import utils from './utils';

const { getRefs } = utils;

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
    .map(([name, { caption, value }]) => {
      const type = value.includes('false') && 'checkbox';

      return `
        <li class="${CLASS_NAME.filterItem}">
          ${getFilterItemMarkup(type, { name, caption, value })}
        </li>`;
    })
    .join('');

  filterList?.insertAdjacentHTML('afterbegin', markup);
  overrideCheckboxBehavior();
}

/**
 * @param {object} name - имя параметра, caption - отображаемое имя
 * @param {string} type
 * @returns разметка для фильтра
 */
function getFilterItemMarkup(type, { name, caption, value }) {
  const itemMenuMarkup = getFilterItemMenuMarkup({ name, value });

  switch (type) {
    case 'checkbox':
      return `
        <label>
          <input type="checkbox" name=${name}>
          <span>${caption || name}</span>
        </label>`;

    default: /* button */
      return `
        <button
          class="${CLASS_NAME.filterItemExpander}" type="button" 
            name="${name}">${caption || name}</button>
        ${itemMenuMarkup}`;
  }
}

/**
 * @param {array} value - массив значений параметра
 * @returns разметка ul-списка опций фильтра
 */
function getFilterItemMenuMarkup({ name, value }) {
  const isColorPalette = name === 'colors';
  const multiselect = isColorPalette ? 'multiselect' : '';

  const applyBtn = isColorPalette
    ? `<button type="button" name="applyFilter">Go</button>`
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
            <input type="checkbox" name="${value}" ${style}>
            <span>${caption}</span>
          </label>
        </li>`;
    })
    .join('');

  return `
    <div class="${CLASS_NAME.filterItemMenu}">
      <ul class="${CLASS_NAME.filterItemOptions}"
        name="${name}" ${multiselect}
      >${itemOptionsMarkup}</ul>
      ${applyBtn}
    </div>`;
}

function isCheckbox(el) {
  return el.nodeName === 'INPUT' && el.type === 'checkbox';
}

/**
 * Ставит для всех ul.filter__options:not([multiselect]) input {...}
 * поведение как у input:radio. То бишь, можно выделить всего один из группы
 */
function overrideCheckboxBehavior() {
  const selector = `.${CLASS_NAME.filterItemOptions}:not([multiselect])`;

  // ставим обработчики для всех ul.filter__options,
  // у которых нет атрибута multiselect
  getRefs(selector)?.forEach(itm =>
    itm.addEventListener('click', e => {
      if (!isCheckbox(e.target)) return;

      // снимаем у всех
      e.currentTarget
        .querySelectorAll('input[type="checkbox"]')
        ?.forEach(itm => (itm.checked = false));

      // кроме текущего
      e.target.checked = true;
    })
  );
}

export default {
  CLASS_NAME,
  makeFilterList,
};
