import refs from './refs';
import queryParams from './rest-data';

const {
  filterPanel,
  filterMenu,
  toggleFilterPanel,
  filterMenuSubitems,
  applyFilter,
} = refs;

const className = {
  filterPanel: 'filter',
  filterPanelHidden: 'filter--hidden',
  filterItem: 'filter__item',
  filterBtn: 'filter__btn',
  filterMenu: 'filter-menu',
  filterMenuHidden: 'filter-menu--hidden',
  filterMenuItem: 'filter-menu__item',
  filterMenuLink: 'filter-menu__link',
};

// TODO: нужен наверное метод типа collectFormData собирающий все данные формы
// Тогда при любом нажатии на подпункт или при клике на apply собираем данные
// и вызываем колбек apply.

const filterData = {
  expanded: null,
  applied: {},
};

// создаем панель фильтров
makeFilterPanel(queryParams);

//
// Event handlers
//

toggleFilterPanel.addEventListener('click', () =>
  filterPanel.classList.toggle(className.filterPanelHidden)
);

filterPanel.addEventListener('click', handleFilterPanelClick);
applyFilter.addEventListener('click', console.log);
filterMenuSubitems.addEventListener('click', handleFilterMenuClick);
// filterMenu.addEventListener('submit', handleFilterMenuSubmit);

function handleFilterMenuClick(e) {
  if (!e.target.classList.contains(className.filterMenuLink)) return;
  // для чекбоксов палитры нельзя вызывать!
  e.preventDefault();

  const { applied, expanded } = filterData;
  applied[expanded.name] = e.target.name;

  console.log(filterData);
}

function handleFilterPanelClick({ target, currentTarget }) {
  // if (target.nodeName === 'INPUT') {
  //   filterData.applied[target.name] = target.checked;
  //   return;
  // }

  // реагируем только на кнопку-фильтр
  if (!target.classList.contains(className.filterBtn)) return;

  filterData.expanded?.removeAttribute('expanded');

  // если меню для фильтра отображено - закрываем его
  if (filterData.expanded?.name === target.name) {
    filterData.expanded = null;
    hideFilterMenu();
  } else {
    // открываем меню и запоминаем фильтр
    filterData.expanded = target;
    target.setAttribute('expanded', '');
    showFilterMenu(target);
  }
}

//
// Funcs
//

function makeFilterMenu(name) {
  const { value } = queryParams[name];

  // filterMenu.name = name;

  let markup = value
    .map((val, idx) => {
      const [value, alias] = val.split('?');
      const label = alias || value;

      return name === 'colors'
        ? `
        <input 
          type="checkbox"
          name="color" 
          style="background-color: ${label}"
        >`
        : `
        <a class="${className.filterMenuLink}" 
          href="#" name="${value}"
        >${label}</a>`;
    })
    .join('');

  filterMenuSubitems.innerHTML = markup;
}

function showFilterMenu({ name }) {
  makeFilterMenu(name);
  // для палитры отображаем кнопку Apply
  applyFilter.style.display = name === 'colors' ? 'block' : 'none';
  filterMenu.classList.remove(className.filterMenuHidden);
}

function hideFilterMenu() {
  filterMenu.classList.add(className.filterMenuHidden);
}

function makeFilterPanel() {
  const markup = Object.entries(queryParams)
    .map(([name, { caption, value }]) => {
      const control = value.includes('false')
        ? `
        <label>
          <input type="checkbox" name=${name}>
          <span>${name}</span>
        </label>`
        : `
        <button
          class="${className.filterBtn}" 
          type="button"
          name="${name}"
        >${caption || name}</button>`;

      return `
        <li class="${className.filterItem}">
          ${control}
        </li>`;
    })
    .join('');

  filterPanel.insertAdjacentHTML('afterbegin', markup);
}
