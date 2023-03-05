import './sass/index.scss';
import { PixabayService } from './js/rest';
import utils from './js/utils';

const searchFormRef = document.querySelector('.search-form');
const searchInputRef = searchFormRef.searchQuery;
const clearInputRef = searchFormRef.clearBtn;

const serv = new PixabayService({
  orientation: 'horizontal',
  page: 1,
  perPage: 40,
  imageType: 'photo',
  // safesearch: true,
});

clearInputRef.addEventListener('click', e => {
  searchInputRef.value = '';
  // чтобы не слетал outline
  searchInputRef.focus();
  renderGallery('.gallery', null);
});

searchFormRef.addEventListener('submit', handleSearchFormSubmit);

function handleSearchFormSubmit(e) {
  e.preventDefault();

  const query = e.currentTarget.searchQuery.value.trim();
  if (!query) return;

  renderGallery('.gallery', null);
  serv.page = 1;

  serv
    .fetch({
      q: query,
    })
    .then(resp => {
      if (resp.totalHits > 0) {
        utils.info(
          `Hooray! We found ${resp.totalHits} images of '${query}'.`,
          2000
        );
      }

      renderGallery('.gallery', resp.hits);
      console.log(resp);
      console.log('page', serv.page);
    })
    .catch(err => {
      utils.error(err.message);
      console.error(err);
    });
}

function renderGallery(classSelector, data = []) {
  const galleryRef = document.querySelector(classSelector);
  if (!galleryRef) return null;

  // очищаем галлерею
  if (data === null) {
    galleryRef.innerHTML = '';
    return galleryRef;
  }

  const markup = data
    .map(itm => {
      const { webformatURL, webformatHeight, webformatWidth, tags } = itm;
      return `
      <li class=${classSelector.slice(1)}__item>
        <a><img src="${webformatURL}" alt="${tags}" width="320"></a>
      </li>`;
    })
    .join('');

  galleryRef.insertAdjacentHTML('beforeend', markup);
}
