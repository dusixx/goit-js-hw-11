import refs from './refs';
import utils from './utils';
import queryParams from './rest-data';

const { mediaFilter, toggleMediaFilter } = refs;

const MEDIA_FILTER_CLASS = mediaFilter.className;
const MEDIA_FILTER_HIDDEN_CLASS = `${MEDIA_FILTER_CLASS}--hidden`;
const BUTTON_CLASS = `${MEDIA_FILTER_CLASS}__btn`;

toggleMediaFilter.addEventListener('click', () =>
  mediaFilter.classList.toggle(MEDIA_FILTER_HIDDEN_CLASS)
);

//
// Funcs
//

makeMediaFilterPanel(mediaFilter, queryParams);

function makeMediaFilterPanel(mediaFilter, queryParams) {
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

  mediaFilter?.insertAdjacentHTML('afterbegin', markup);
}
