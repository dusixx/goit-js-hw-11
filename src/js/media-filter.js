import utils from './utils';
import refs from './refs';
import queryParams from './rest-data';

const { getRef } = utils;
const { filterMenu, toggleFilterMenu } = refs;

const CLASS_NAME = {
  filterMenu: 'filter',
  filterMenuExpander: 'filter__expander',
  filterMenuHidden: 'filter--hidden',
  filterMenuItem: 'filter__item',
  filterMenuOptions: 'filter__options',
  filterMenuOptionsHidden: 'filter__options--hidden',
  // filterMenuOption: 'filter__option',
};

// создаем панель фильтров
makeFiltersMenu(queryParams);

//
// Event handlers
//

toggleFilterMenu.addEventListener('click', () =>
  filterMenu.classList.toggle(CLASS_NAME.filterMenuHidden)
);

// filterMenu.addEventListener('click', handlefilterMenuClick);
//applyFilter.addEventListener('click', console.log);
//filterMenuSubitems.addEventListener('click', handleFilterMenuClick);
// filterMenu.addEventListener('submit', handleFilterMenuSubmit);

// function handleFilterMenuClick(e) {
//   if (!e.target.classList.contains(CLASS_NAME.filterMenuLink)) return;
//   // для чекбоксов палитры нельзя вызывать!
//   e.preventDefault();

//   const { applied, expanded } = filterData;
//   applied[expanded.name] = e.target.name;

//   console.log(filterData);
// }

// function handlefilterMenuClick({ target, currentTarget }) {
//   // реагируем только на кнопку-фильтр
//   if (!target.classList.contains(CLASS_NAME.filterBtn)) return;

//   filterData.expanded?.removeAttribute('expanded');

//   // если меню для фильтра отображено - закрываем его
//   if (filterData.expanded?.name === target.name) {
//     filterData.expanded = null;
//     hideFilterMenu();
//   } else {
//     // открываем меню и запоминаем фильтр
//     filterData.expanded = target;
//     target.setAttribute('expanded', '');
//     showFilterMenu(target);
//   }
// }

//
// Funcs
//

/**
 * @param {object} queryParams данные о параметрах сервиса
 */
function makeFiltersMenu(queryParams) {
  const markup = Object.entries(queryParams)
    .map(([name, { caption, value }]) => {
      const type = value.includes('false') && 'checkbox';

      return `
        <li class="${CLASS_NAME.filterMenuItem}">
          ${getFilterItemMarkup(type, { name, caption, value })}
        </li>`;
    })
    .join('');

  filterMenu.insertAdjacentHTML('afterbegin', markup);
}

/**
 * @param {string} type
 * @param {object} name - имя параметра, caption - отображаемое имя
 * @returns разметка для фильтра
 */
function getFilterItemMarkup(type, { name, caption, value }) {
  const optionsList = getFilterOptionsListMarkup({ name, value });

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
          class="${CLASS_NAME.filterMenuExpander}" 
          type="button" name="${name}"
        >${caption || name}</button>
        ${optionsList}`;
  }
}

// TODO: как-то надо разделить фукнцию на более мелкие

/**
 * @param {array} value - массив значений параметра
 * @param {boolean} isColorPalette
 * @returns разметка ul-списка опций фильтра
 */
function getFilterOptionsListMarkup({ name, value }) {
  const classList = `${CLASS_NAME.filterMenuOptions} ${CLASS_NAME.filterMenuOptionsHidden}`;
  const isColorPalette = name === 'colors';

  const applyBtn = isColorPalette
    ? `<button type="button" name="applyFilter">OK</button>`
    : '';

  const optionItemsMarkup = value
    .map(v => {
      const [value, alias] = v.split('?');
      const caption = isColorPalette ? value : alias || value;

      const style = isColorPalette
        ? `style="background-color: ${alias || value}"`
        : '';

      return `
        <li>
          <label>
            <input type="checkbox" name="${value}" ${style}>
            <span>${caption}</span>
          </label>
        </li>`;
    })
    .join('');

  return `
    <div>
      <ul class="${classList}" 
        name="${name}">${optionItemsMarkup}</ul>
      ${applyBtn}
    </div>`;
}
