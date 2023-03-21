import refs from './refs';
import utils from './utils';
import queryParams from './rest-data';

const { filterPanel, filterMenu, toggleFilterPanel } = refs;

const className = {
  filterPanel: filterPanel.className,
  filterPanelHidden: `${filterPanel.className}--hidden`,
  filterPanelItem: `${filterPanel.className}__item`,
};

// создаем панель фильтров
makeFilterPanel(filterPanel, queryParams);

toggleFilterPanel.addEventListener('click', () =>
  filterPanel.classList.toggle(className.filterPanelHidden)
);

filterPanel.addEventListener('click', handleFilterPanelClick);

function handleFilterPanelClick({ target }) {
  if (target.nodeName !== 'BUTTON') return;
}

function makeFilterMenu({ name }, queryParams) {}

function makeFilterPanel(filterPanel, queryParams) {
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

  filterPanel?.insertAdjacentHTML('afterbegin', markup);
}
