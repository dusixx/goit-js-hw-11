import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';
import filterMarkup from './filter-markup';

const { filterList, body } = refs;
const { makeFilterList, CLASS_NAME, APPLY_BUTTON_NAME } = filterMarkup;
const { getRefs, isObj, isFunc, fitIntoRange, getTypeName, camelToSnake } =
  utils;

let onChangeHandler;
let filterListToggler;
let instance;

export default class Filter {
  setData = setData;

  show() {
    return filterList.classList.remove(CLASS_NAME.filterListHidden);
  }

  hide() {
    return filterList.classList.add(CLASS_NAME.filterListHidden);
  }

  getData() {
    return getData(filterList);
  }

  /**
   * @param {object} {...}
   *    toggler - элемент для открытия/закрытия панели фильтров
   *    onChange - обработчик, вызваемый при изменении параметров
   */
  constructor({ toggler, onChange, data } = {}) {
    // синглтон
    if (instance) return instance;
    instance = this;

    // создаем панель фильтров
    makeFilterList(filterList, queryParams);

    // отключаем стандартное поведение, иначе при нажатии Enter
    // в любом из input:(number|text) будет перегружаться страница
    filterList.addEventListener('submit', e => e.preventDefault());

    // кастомное поведение контролов
    setCheckboxBehavior();
    setInputElementBehavior();
    setApplyFilterBehavior();
    setFilterExpanderBehavior();
    handleGrayscaleOptionChange();

    // ставим заданные параметры
    setFilterListToggler(toggler);
    onChangeHandler = isFunc(onChange) ? onChange : null;
    setData(data);
  }
}

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
 * При включенном grayscale отключает выбор других цветов в палитре
 */
function handleGrayscaleOptionChange() {
  filterList
    .querySelector(`.${CLASS_NAME.filterItemOption}#grayscale`)
    ?.addEventListener('change', disableUnderlying);

  function disableUnderlying({ target, currentTarget }) {
    if (target.nodeName !== 'INPUT') return;

    let sib = currentTarget.nextElementSibling;
    // отключаем нижележащие чекбоксы
    for (; sib !== null; sib = sib.nextElementSibling) {
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
  filterList.addEventListener('click', handleInputClick);

  function handleInputClick({ target }) {
    if (
      target.nodeName !== 'INPUT' ||
      !['number', 'text'].includes(target.type)
    )
      return;
    target.select();
  }

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
  return el.nodeName === 'INPUT' && el.type.toLowerCase() === 'checkbox';
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
    // снимаем у всех, кроме текущего
    currentTarget
      .querySelectorAll('input[type="checkbox"]')
      ?.forEach(itm => (itm.checked = false));
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

    const checked = getCheckedOptions(filterItem);
    // data-active="true"
    checked.forEach(itm => (itm.dataset.active = 'true'));

    // показываем кнопку очистки фильтра, при необходимости
    clearFilter.style.display = checked.length ? 'inline' : 'none';
    if (checked.length) setClearFilterBehavior(clearFilter);

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
      getCheckedOptions(filterItem).forEach(itm => {
        itm.checked && itm.click();
        // data-active="false"
        itm.dataset.active = 'false';
      });

      target.style.display = 'none';

      submitFilterData(target);
    },
    { once: true }
  );
}

/**
 *
 * @param {object} parent - элемент, для которого получаем список опций
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
 * @param {object} initiator - инициатор события
 * @returns
 */
function submitFilterData(initiator) {
  return onChangeHandler && onChangeHandler(getData(filterList), initiator);
}

/**
 *
 * @param {object} form - целевая форма
 * @returns объект с данными {name: value,...}
 */
function getData(form) {
  // массив имен актуальных input-ов
  const elementNames = Array.from(new FormData(form).keys());

  return elementNames.reduce((obj, name) => {
    let elements = form[name];
    elements = elements.length ? Array.from(elements) : [elements];

    // получаем массив значений для активных элементов
    const values = elements
      .filter(elem => {
        const dataActive = elem.dataset.active;
        const checked = isCheckbox(elem) ? elem.checked : true;
        const active = dataActive ? dataActive === 'true' : true;

        // если есть атрибут data-active и он "true" - опция была применена
        // Актуально для multiselect опций, применяемых кнопкой Apply
        return !elem.disabled && active && checked;
      })
      .map(elem => elem.value);

    obj[name] = values.length === 1 ? values[0] : values;

    return obj;
  }, {});
}

/**
 *
 * @param {*} cbox
 * @param {*} value
 */
function checkOption(cbox, checked = true) {
  cbox.checked = !checked;
  cbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

/**
 *
 * @param {*} inputElem
 * @param {*} value
 */
function changeValue(inputElem, value) {
  inputElem.value = value;
  inputElem.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 *
 * @param {*} name
 * @param {*} value
 * @returns
 */
function setOption(name, value) {
  name = camelToSnake(name);

  if (!filterList.hasOwnProperty(name)) return;
  const elem = filterList[name];

  switch (getTypeName(elem)) {
    case 'RadioNodeList':
      return setOptionsGroup(elem, value);

    case 'HTMLInputElement':
      return elem.type === 'checkbox'
        ? checkOption(elem, value)
        : changeValue(elem, value);
  }
}

/**
 *
 * @param {*} group
 * @param {*} value
 * @returns
 */
function setOptionsGroup(group, value) {
  if (!Array.isArray(value)) value = [value];

  const multiselOptions = group[0].closest(
    `.${CLASS_NAME.filterItemOptions}[multiselect]`
  );

  if (multiselOptions) {
    // заданные ставим, остальные снимаем и кликаем на Apply
    group.forEach(cb => checkOption(cb, value.includes(cb.value)));
    return multiselOptions.nextElementSibling.click();
  }

  // ставим заданный, остальные будут сняты в setCheckboxBehavior()
  group.forEach(cb => value.includes(cb.value) && checkOption(cb));
}

/**
 *
 * @param {*} data
 */
function setData(data) {
  Object.entries(data).forEach(([name, value]) => setOption(name, value));
}
