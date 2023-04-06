import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';
import filterMarkup from './filter-markup';

const { filterList, body } = refs;
const { getRefs, isObj, isFunc, fitIntoRange, debounce } = utils;
const { makeFilterList, CLASS_NAME, APPLY_BUTTON_NAME } = filterMarkup;

let onApplyHandler;
let filterListToggler;

export default class Filter {
  static #instance;
  /**
   *
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
    setFilterExpanderBehavior();
    handleGrayscaleCheckboxChange();

    // ставим обработчик для тоглера и самбита формы
    setFilterListToggler(toggler);
    onApplyHandler = isFunc(onApply) ? onApply : null;

    Filter.#instance = this;
  }
}

// отключаем стандартное поведение, иначе при нажатии Enter
// в любом из input:number(text) будет перегружаться страница
filterList.addEventListener('submit', e => e.preventDefault());

/**
 *
 * Ставит обработчик, показывающий/скрывающий меню при клике на toggler
 * Если toggler не функция, снимает обработчик
 * @param {*} toggler
 */
function setFilterListToggler(toggler) {
  const toggleFilterList = () =>
    filterList.classList.toggle(CLASS_NAME.filterListHidden);

  if (isFunc(toggler?.addEventListener)) {
    (filterListToggler = toggler).addEventListener('click', toggleFilterList);
  } else {
    filterListToggler?.removeEventListener('click', toggleFilterList);
    filterListToggler = null;
  }
}

/**
 *
 * Устанавливает поведение для меню (закрытие/открытие)
 */
function setFilterExpanderBehavior() {
  filterList.addEventListener('click', handleFilterExpanderClick);

  function handleFilterExpanderClick({ target }) {
    const { classList } = target;

    // ловим клик по button.filter__expander
    if (!classList.contains(CLASS_NAME.filterItemExpander)) return;

    const filterItem = target.parentNode;
    const filterExpander = target;

    // при клике на button.filter__expander--epxanded - закрываем меню

    const isExpanded = !classList.toggle(CLASS_NAME.filterItemExpanderExpanded);
    if (isExpanded) return collapseFilterMenu(filterExpander);

    // если был клик за пределами текущего div.filter - закрываем меню
    // и снимаем обработчик с body

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
 *
 * При включенном grayscale отключает остальные цвета в палитре
 */
function handleGrayscaleCheckboxChange() {
  filterList
    .querySelector(`.${CLASS_NAME.filterItemOption}#grayscale`)
    ?.addEventListener('change', disableUnderlying);

  function disableUnderlying({ target, currentTarget }) {
    if (target.nodeName !== 'INPUT') return;

    // отключаем нижележащие чекбоксы
    for (
      let sib = currentTarget.nextElementSibling;
      sib !== null;
      sib = sib.nextElementSibling
    ) {
      sib.style.opacity = target.checked ? '0.5' : null;
      sib.firstElementChild.firstElementChild.disabled = target.checked;
    }
  }
}

/**
 *
 * Ставит для всех .filter-list input поведение, при котром
 * если в контейнере нет кнопки типа Apply - опция применяется сразу
 */
function setInputElementBehavior() {
  filterList.addEventListener('change', handleInputChange);

  function handleInputChange({ target }) {
    if (target.nodeName !== 'INPUT') return;

    checkValue(target);

    const hasApplyBtn =
      // кнопка стоит сразу после блока опций
      target.closest(`.${CLASS_NAME.filterItemOptions}`)?.nextElementSibling
        ?.name === APPLY_BUTTON_NAME;

    if (!hasApplyBtn) submitFilterData(target);
  }

  /**
   * Корректирует value в рамках диапазона [min,max]
   * @param {*} target - input:number элемент
   */
  function checkValue(target) {
    const { type, value, min, max } = target;

    if (type.toLowerCase() === 'number') {
      target.value = fitIntoRange({ value, min, max }) || min || 0;
    }
  }
}

function isCheckbox(el) {
  return el.nodeName === 'INPUT' && el.type === 'checkbox';
}

/**
 *
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
 *
 * Ставит для всех кнопок типа Apply поведение, при клике на них
 */
function setApplyFilterBehavior() {
  const applyBtns = filterList.querySelectorAll(
    `button[name="${APPLY_BUTTON_NAME}"]`
  );

  applyBtns.forEach(itm => {
    itm.addEventListener('click', e => {
      updateFilterItemOnApply(e);
      submitFilterData(e.target);
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
 *
 * Ставит паоведение для кнопки(х) очитски фильтра
 * @param {object} clearFilter - элемент "кнопки" очистки фильтра
 */
function setClearFilterBehavior(clearFilter) {
  clearFilter?.addEventListener(
    'click',
    ({ target }) => {
      const { filterItem } = getParentFilterItem(target);

      // снимаем все опции и скрываем кнопку
      // click(), чтобы включались/выключались нижлежащие
      getCheckedOptions(filterItem).forEach(itm => itm.checked && itm.click());
      target.style.display = 'none';

      submitFilterData(target);
    },
    { once: true }
  );
}

/**
 *
 * @param {object} parent - элемент, относительно которого получаем список опций
 * @param {boolean} enabled - если true, вернет только :not([disabled]) опции
 * @returns {NodeList} список элементов
 */
function getCheckedOptions(parent, enabled = true) {
  const state = enabled ? ':not([disabled])' : '';
  return parent.querySelectorAll(`input[type="checkbox"]${state}:checked`);
}

function getParentFilterItem(child) {
  const filterItem = child.closest(`.${CLASS_NAME.filterItem}`);
  const filterExpander = filterItem?.firstElementChild;

  return { filterItem, filterExpander };
}

function collapseFilterMenu(filterExpander) {
  filterExpander.classList.remove(CLASS_NAME.filterItemExpanderExpanded);
}

/**
 *
 * @param {*} targetInput - инициатор события
 * @returns
 */
function submitFilterData(target) {
  return onApplyHandler && onApplyHandler(getData(filterList), target);
}

/**
 *
 * @param {object} form - целевая форма
 * @returns данные формы в формате {name: v1, name1: [v1, v2,...],...}
 */
function getData(form) {
  const formData = new FormData(form);

  // если в массиве одно значение, ставим его как есть
  return Array.from(formData.keys()).reduce((obj, name) => {
    const values = formData.getAll(name);
    obj[name] = values.length === 1 ? values[0] : values;

    return obj;
  }, {});
}

function setData(data = {}) {}
