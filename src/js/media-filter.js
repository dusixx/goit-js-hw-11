import refs from './refs';
import queryParams from './rest-data';

const { filterPanel, filterMenu, toggleFilterPanel } = refs;

const className = {
  filterPanel: 'filter-panel',
  filterPanelHidden: `filter-panel--hidden`,
  filterPanelItem: `filter-panel__item`,
  filterMenuHidden: `filter-panel__menu--hidden`,
};

// создаем панель фильтров
makeFilterPanel(queryParams);

toggleFilterPanel.addEventListener('click', () =>
  filterPanel.classList.toggle(className.filterPanelHidden)
);

filterPanel.addEventListener('click', handleFilterPanelClick);

function handleFilterPanelClick({ target, currentTarget }) {
  if (target.nodeName !== 'BUTTON') return;
  const { dataset } = currentTarget;

  // снимае active с текущего фильтра
  currentTarget
    .querySelector(`[name="${dataset.active}"]`)
    ?.removeAttribute('active');

  // если меню для фильта отображено - закрываем его
  if (dataset.active === target.name) {
    dataset.active = '';
    return showFilterMenu(target, false);
  }

  dataset.active = target.name;
  target.setAttribute('active', '');
  showFilterMenu(target, true);
}

function makeFilterMenu(name, shouldMake = true) {
  const { value, alias = {} } = queryParams[name];

  filterMenu.innerHTML = shouldMake
    ? value
        .map((val, idx) => {
          const label = alias[idx] || val;

          return `
            <li>
              <a href="#"
                name="${name}" 
                value="${val}">
                <span>${label}</span>
              </a>
            </li>`;
        })
        .join('')
    : '';
}

function showFilterMenu({ name }, show = true) {
  const action = show ? 'remove' : 'add';

  makeFilterMenu(name, show);
  filterMenu.classList[action](className.filterMenuHidden);
}

function makeFilterPanel() {
  const markup = Object.entries(queryParams)
    .map(([name, { caption, value, alias }]) => {
      // bool -> checkbox
      const control = value.includes('false')
        ? `
        <label>
          <input type="checkbox" name=${name}>
          <span>${name}</span>
        </label>`
        : `
        <button type="button" name = "${name}">
          ${caption || name}
        </button>`;

      return `
        <li class ="${className.filterPanelItem}">
          ${control}
        </li>`;
    })
    .join('');

  filterPanel.insertAdjacentHTML('afterbegin', markup);
}
