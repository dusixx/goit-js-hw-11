import refs from './refs';
import queryParams from './rest-data';

const { filterPanel, filterMenu, toggleFilterPanel } = refs;

const className = {
  filterPanel: 'filter-panel',
  filterPanelHidden: 'filter-panel--hidden',
  filterPanelItem: 'filter-panel__item',
  filterMenuHidden: 'filter-menu--hidden',
  filterMenuItem: 'filter-menu__item',
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

  // TODO: сделать формой - удобнее будет доставать - или баттоны не добавятся свойствами?
  // снимае active с текущего фильтра
  currentTarget
    .querySelector(`[name="${dataset.active}"]`)
    ?.removeAttribute('active');

  // если меню для фильта отображено - закрываем его
  if (dataset.active === target.name) {
    dataset.active = filterMenu.innerHTML = '';
    return;
  }

  // открываем меню для фильтра и запоминаем его имя
  dataset.active = target.name;
  target.setAttribute('active', '');
  showFilterMenu(target);
}

// function makeFilterMenuItem(itemClass,)

function makeFilterMenu(name) {
  const { value } = queryParams[name];

  filterMenu.innerHTML = value
    .map((val, idx) => {
      const [value, alias] = val.split('?');

      return `
            <li class="${className.filterMenuItem}">
              <a href="#"
                name="${name}" 
                value="${value}">
                <span>${alias || value}</span>
              </a>
            </li>`;
    })
    .join('');
}

// TODO: доделать используя input:checkbox(?)
function makeColorPalette(name) {}

function showFilterMenu({ name }, show = true) {
  const action = show ? 'remove' : 'add';

  name === 'colors' ? makeColorPalette(name) : makeFilterMenu(name, show);

  filterMenu.classList[action](className.filterMenuHidden);
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
        <button type="button" name="${name}">
          ${caption || name}
        </button>`;

      return `
        <li class="${className.filterPanelItem}">
          ${control}
        </li>`;
    })
    .join('');

  filterPanel.insertAdjacentHTML('afterbegin', markup);
}
