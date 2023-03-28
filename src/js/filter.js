//
// NOTE: функционал зависит от разметки и неоптимизирован
//

import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';
import filterMarkup from './filter-markup';

const { getRefs, isObj, isFunc } = utils;
const { filterList, body } = refs;
const { makeFilterList, CLASS_NAME, APPLY_BUTTON_NAME } = filterMarkup;

let onApplyHandler;
let filterListToggler;

export default class Filter {
  static #instance;
  /**
   * @param {object} {...}
   *    toggler - элемент для открытия/закрытия панели фильтров
   *    onApply - обработчик, вызваемый в момент применения параметров
   */
  constructor({ toggler, onApply } = {}) {
    // синглтон
    if (Filter.#instance) return Filter.#instance;

    makeFilterList(filterList, queryParams);

    // кастомное поведение контролов
    setCheckboxBehavior();
    setInputElementBehavior();
    setApplyFilterBehavior();

    // ставим обработчик для тоглера
    if (isFunc(toggler?.addEventListener)) {
      (filterListToggler = toggler).addEventListener('click', () =>
        filterList.classList.toggle(CLASS_NAME.filterListHidden)
      );
    }

    // обработчик кстомного самбита формы
    if (isFunc(onApply)) onApplyHandler = onApply;

    Filter.#instance = this;
  }
}

//
//////////////////////////
// Основной функционал
//////////////////////////
//

function isCheckbox(el) {
  return el.nodeName === 'INPUT' && el.type === 'checkbox';
}

filterList.addEventListener('click', handleFilterExpanderClick);

function handleFilterExpanderClick({ target }) {
  const { classList } = target;
  //
  // ловим клик по button.filter__expander
  //
  // TODO: надо обновлять чекбоксы при открытии для !multiline
  // Надо для этого написать setData() и все делать через нее
  //
  if (classList.contains(CLASS_NAME.filterItemExpander)) {
    const filterItem = target.parentNode;
    const filterExpander = target;

    // при клике на button.filter__expander--epxanded - закрываем меню
    const isExpanded = !classList.toggle(CLASS_NAME.filterItemExpanderExpanded);
    if (isExpanded) return collapseFilterMenu(filterExpander);

    //
    // ловим клики за пределами текущего div.filter
    //
    body.addEventListener('click', handleBodyMousedown);

    function handleBodyMousedown({ target }) {
      const wasClickedOutsideFilterItem =
        target.closest(`.${CLASS_NAME.filterItem}`) !== filterItem;

      if (wasClickedOutsideFilterItem) {
        collapseFilterMenu(filterExpander);
        body.removeEventListener('click', handleBodyMousedown);
      }
    }
  }
}

/**
 * Ставит для всех .filter-list input поведение, при котром
 * если в контейнере нет кнопки applyFilter - опция применяется сразу
 */
function setInputElementBehavior() {
  filterList.addEventListener('change', handleInputChange);

  function handleInputChange({ target }) {
    if (target.nodeName !== 'INPUT') return;

    const hasApplyBtn =
      target.closest(`.${CLASS_NAME.filterItemOptions}`)?.nextElementSibling
        ?.name === APPLY_BUTTON_NAME;

    if (!hasApplyBtn) submitFilterData();
  }
}

/**
 * Ставит для всех .filter__options:not([multiselect]) input
 * поведение как у input:radio - можно выбрать лишь один из многих
 */
function setCheckboxBehavior() {
  const filterOpts = `.${CLASS_NAME.filterItemOptions}:not([multiselect])`;

  // ставим обработчики для всех .filter__options,у которых нет [multiselect]
  getRefs(filterOpts)?.forEach(itm =>
    itm.addEventListener('click', handleCheckboxClick)
  );

  function handleCheckboxClick(e) {
    if (!isCheckbox(e.target)) return;
    selectOnlyOne(e);
    updateFilterItem(e);
  }

  function selectOnlyOne({ target, currentTarget }) {
    // снимаем у всех
    currentTarget
      .querySelectorAll('input[type="checkbox"]')
      ?.forEach(itm => (itm.checked = false));
    // кроме текущего
    target.checked = true;
  }

  function updateFilterItem({ target }) {
    const { filterExpander } = getParentFilterItem(target);
    const caption = target.nextElementSibling.textContent;

    filterExpander.textContent = caption;
    collapseFilterMenu(filterExpander);
  }
}

/**
 * ???
 */
function setApplyFilterBehavior() {
  const applyBtns = filterList.querySelectorAll(
    `button[name="${APPLY_BUTTON_NAME}"]`
  );

  applyBtns.forEach(itm => {
    itm.addEventListener('click', e => {
      updateFilterItemOnApply(e);
      submitFilterData();
    });
  });

  function updateFilterItemOnApply({ target }) {
    const { filterItem, filterExpander } = getParentFilterItem(target);
    const clearFilter = filterExpander.firstElementChild;

    // считаем кол-во выбранных (включенных) чекбоксов
    const checkedCount = getCheckedOptions(filterItem).length;

    // показываем кнопку очистки фильтра, при необходимости
    clearFilter.style.display = checkedCount ? 'inline' : 'none';
    if (checkedCount) setClearFilterBehavior(clearFilter);

    // закрываем меню
    collapseFilterMenu(filterExpander);
  }
}

/**
 * @param {object} clearFilter - элемент "кнопки" очистки фильтра
 */
function setClearFilterBehavior(clearFilter) {
  clearFilter?.addEventListener(
    'click',
    ({ target }) => {
      const { filterItem } = getParentFilterItem(target);
      // снимаем все опции и скрываем кнопку
      getCheckedOptions(filterItem).forEach(itm => (itm.checked = false));
      target.style.display = 'none';

      submitFilterData();
    },
    { once: true }
  );
}

/**
 * @param {object} parent - элемент, относительно которого получаем список опций
 * @param {boolean} enabled - если true, вернет только :not(disabled) опции
 * @returns {NodeList} список элементов
 */
function getCheckedOptions(parent, enabled = true) {
  const state = enabled ? ':not(disabled)' : '';
  return parent.querySelectorAll(`input[type="checkbox"]${state}:checked`);
}

function getParentFilterItem(child) {
  // NOTE: разметка критична (для firstElementChild)
  const filterItem = child.closest(`.${CLASS_NAME.filterItem}`);
  const filterExpander = filterItem?.firstElementChild;

  return { filterItem, filterExpander };
}

function collapseFilterMenu(filterExpander) {
  filterExpander.classList.remove(CLASS_NAME.filterItemExpanderExpanded);
}

function submitFilterData() {
  return onApplyHandler && onApplyHandler(getData(filterList));
}

/**
 * @param {object} form - целевая форма
 * @returns данные формы в формате {name: value, name1: [values],...}
 */
function getData(form) {
  const formData = new FormData(form);

  // если в массиве одно значение, ставим его как есть
  return Array.from(formData.keys()).reduce((obj, name) => {
    let values = formData.getAll(name);
    obj[name] = values.length === 1 ? values[0] : values;

    return obj;
  }, {});
}

function setData() {}
