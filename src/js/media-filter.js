import refs from './refs';
import queryParams from './rest-data';

const {
  filterPanel,
  filterMenu,
  toggleFilterPanel,
  filterMenuControls,
  applyFilter,
} = refs;

const className = {
  filterPanel: 'filter',
  filterPanelHidden: 'filter--hidden',
  filterItem: 'filter__item',
  filterBtn: 'filter__btn',
  filterMenuHidden: 'filter-menu--hidden',
  filterMenuItem: 'filter-menu__item',
};

// создаем панель фильтров
makeFilterPanel(queryParams);

toggleFilterPanel.addEventListener('click', () =>
  filterPanel.classList.toggle(className.filterPanelHidden)
);

filterPanel.addEventListener('click', handleFilterPanelClick);
applyFilter.addEventListener('click', console.log);
// filterMenu.addEventListener('click', handleFilterMenuClick);
// filterMenu.addEventListener('submit', handleFilterMenuSubmit);

function handleFilterPanelClick({ target, currentTarget }) {
  // реагируем только на кнопку-фильтр
  if (!target.classList.contains(className.filterBtn)) return;

  const { dataset } = currentTarget;

  // снимаем active с текущего фильтра
  currentTarget
    .querySelector(`[name="${dataset.active}"]`)
    ?.removeAttribute('active');

  // если меню для фильта отображено - закрываем его
  if (dataset.active === target.name) {
    dataset.active = '';
    hideFilterMenu();
    return;
  }

  // открываем меню и запоминаем имя активного фильтра
  dataset.active = target.name;
  target.setAttribute('active', '');
  showFilterMenu(target);
}

function makeFilterMenu(name) {
  const { value } = queryParams[name];

  filterMenu.name = name;

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
        <a href="#" name="${value}">
          <span>${label}</span>
        </a>`;
    })
    .join('');

  filterMenuControls.innerHTML = markup;
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
