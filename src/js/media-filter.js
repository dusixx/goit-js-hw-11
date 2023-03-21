import refs from './refs';
import utils from './utils';
import queryParams from './rest-data';

const { mediaFilter, toggleMediaFilter } = refs;

const BUTTON_CLASS = `${mediaFilter.className}__btn`;
const MEDIA_FILTER_HIDDEN_CLASS = 'media-filter--hidden';

makeMediaFilterPanel(mediaFilter);

toggleMediaFilter.addEventListener('click', handleToggleMediaFilterClick);

function handleToggleMediaFilterClick(e) {
  mediaFilter.classList.toggle(MEDIA_FILTER_HIDDEN_CLASS);
}

function makeMediaFilterPanel(mediaFilter) {
  const markup = Object.entries(queryParams)
    .map(([name, { caption, value, alias }]) => {
      // bool -> checkbox
      return value.includes('false')
        ? `
        <label>
            <input type="checkbox" name=${name}>
            <span>${name}</span>
        </label>`
        : `
        <button
            class="${BUTTON_CLASS}" 
            type="button"
            name = "${name}"
        >
            ${caption || name}
        </button>`;
    })
    .join('');

  mediaFilter?.insertAdjacentHTML('beforeend', markup);
}
