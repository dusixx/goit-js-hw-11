import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';

const { filterList } = refs;
const { getRefs } = utils;

const APPLY_BUTTON_NAME = 'applyFilter';
const FILTER_MENU_ID = 'filter_menu';

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

filterList.addEventListener('click', handleFilterListClick);

function handleFilterListClick({ target }) {
  const { classList } = target;

  // button.filter__expander
  if (classList.contains(CLASS_NAME.filterItemExpander)) {
    const isExpanded = classList.toggle(CLASS_NAME.filterItemExpanderExpanded);
    const filterExpander = target;

    // 'click' нельзя - не откроется меню при клике на expander
    document.documentElement.addEventListener('mousedown', ({ target }) => {
      if (
        target.id !== FILTER_MENU_ID &&
        !target.closest(`#${FILTER_MENU_ID}`)
      ) {
        collapseFilterMenu(filterExpander);
      }
    });
  }
}

/**
 * @param {object} queryParams данные о параметрах REST API
 */
function makeFilterList(filterList, queryParams) {
  const markup = Object.entries(queryParams)
    .map(([name, { caption, value }]) => {
      const type = value.includes('false') && 'checkbox';

      return `
        <div class="${CLASS_NAME.filterItem}">
          ${getFilterItemMarkup(type, { name, caption, value })}
        </div>`;
    })
    .join('');

  // рендерим разметку
  filterList?.insertAdjacentHTML('afterbegin', markup);

  // ставим кастомное поведение
  setCheckboxBehavior();
  setApplyFilterBehavior();
  // setFilterMenuBehavior();
}

/**
 * @param {object} name - имя параметра, caption - отображаемое имя
 * @param {string} type
 * @returns разметка для фильтра
 */
function getFilterItemMarkup(type, { name, caption, value }) {
  const itemMenuMarkup = getFilterItemMenuMarkup({ name, value });

  // TODO: неверно надо написать функцию клика и установки кепшна и юзать тут ее,
  // чтобы чекбокс ставить тоже
  if (utils.isInt(caption)) {
    const [val, alias] = value[caption].split('?');
    caption = alias || val;
  }

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
            name="${name}"><span></span>${caption || name}</button>
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
            <input type="checkbox" name="${value}" ${style}>
            <span>${caption}</span>
          </label>
        </li>`;
    })
    .join('');

  return `
    <div class="${CLASS_NAME.filterItemMenu}" id="filter_menu">
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
 * Ставит для всех ul.filter__options:not([multiselect]) input
 * поведение как у input:radio. То бишь, можно выбрать только один из многих
 */
function setCheckboxBehavior() {
  const filterOpts = `.${CLASS_NAME.filterItemOptions}`;
  const filterOptsNoMulti = `${filterOpts}:not([multiselect])`;

  // ставим обработчики для всех ul.filter__options,
  // у которых нет атрибута multiselect
  getRefs(filterOptsNoMulti)?.forEach(itm =>
    itm.addEventListener('click', e => {
      if (!isCheckbox(e.target)) return;
      //
      selectOneOnly(e);
      updateExpanderCaption(e);
    })
  );

  function selectOneOnly(e) {
    // снимаем у всех
    e.currentTarget
      .querySelectorAll('input[type="checkbox"]')
      ?.forEach(itm => (itm.checked = false));

    // кроме текущего
    e.target.checked = true;
  }

  function updateExpanderCaption({ target }) {
    const caption = target.nextElementSibling.textContent;
    const filterItem = target.closest(`.${CLASS_NAME.filterItem}`);
    const filterExpander = filterItem.firstElementChild;

    filterExpander.textContent = caption;
    collapseFilterMenu(filterExpander);
  }
}

function setApplyFilterBehavior(e) {
  const applyBtns = filterList.querySelectorAll(
    `button[name="${APPLY_BUTTON_NAME}"]`
  );

  applyBtns.forEach(itm => {
    itm.addEventListener('click', e => {
      updateExpanderCaption(e);
    });
  });

  function updateExpanderCaption({ target }) {
    const filterItem = target.closest(`.${CLASS_NAME.filterItem}`);
    const filterExpander = filterItem.firstElementChild;
    const filterExpanderCounter = filterExpander.firstElementChild;

    // считаем кол-во включенных выбранных чекбоксов
    const appliedCount = filterItem.querySelectorAll(
      'input[type="checkbox"]:not(disabled):checked'
    ).length;

    // TODO: лучше крестик для очистки
    filterExpanderCounter.textContent = appliedCount || '';
    filterExpanderCounter.style.marginRight = appliedCount && '5px';
    collapseFilterMenu(filterExpander);
  }
}

function collapseFilterMenu(filterExpander) {
  filterExpander.classList.remove(CLASS_NAME.filterItemExpanderExpanded);
}

function collectData() {
  // filterList.
}

export default {
  CLASS_NAME,
  makeFilterList,
};
