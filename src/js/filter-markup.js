const CLASS_NAME = {
  filterList: 'filter-list',
  filterListHidden: 'filter-list--hidden',
  filterItem: 'filter',
  filterItemExpander: 'filter__expander',
  filterItemExpanderExpanded: 'filter__expander--expanded',
  filterItemMenu: 'filter__menu',
  filterItemOptions: 'filter__options',
  filterItemMenuHidden: 'filter__menu--hidden',
};

/**
 * @param {object} queryParams данные о параметрах REST API
 */
function makeFilterList(filterList, queryParams) {
  const markup = Object.entries(queryParams)
    .map(([name, { caption, value }]) => {
      const type = value.includes('false') && 'checkbox';

      return `
        <li class="${CLASS_NAME.filterItem}">
          ${getFilterItemMarkup(type, { name, caption, value })}
        </li>`;
    })
    .join('');

  filterList?.insertAdjacentHTML('afterbegin', markup);
}

/**
 * @param {object} name - имя параметра, caption - отображаемое имя
 * @param {string} type
 * @returns разметка для фильтра
 */
function getFilterItemMarkup(type, { name, caption, value }) {
  const itemMenuMarkup = getFilterItemMenuMarkup({ name, value });

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
            name="${name}">${caption || name}</button>
        ${itemMenuMarkup}`;
  }
}

/**
 * @param {array} value - массив значений параметра
 * @returns разметка ul-списка опций фильтра
 */
function getFilterItemMenuMarkup({ name, value }) {
  const classList = `${CLASS_NAME.filterItemOptions}`;
  const isColorPalette = name === 'colors';

  const applyBtn = isColorPalette
    ? `<button type="button" name="applyFilter">Go</button>`
    : '';

  const itemOptionsMarkup = value
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
    <div class="${CLASS_NAME.filterItemMenu} ${CLASS_NAME.filterItemMenuHidden}">
      <ul class="${classList}" name="${name}">${itemOptionsMarkup}</ul>
      ${applyBtn}
    </div>`;
}

export default {
  CLASS_NAME,
  makeFilterList,
};
