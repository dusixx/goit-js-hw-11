import utils from './utils';

const { formatNumber } = utils;

// const CLASS_NAME = {
//   gallery: 'gallery',
//   galleryItem: 'gallery__item',
//   galleryLink: 'gallery__link',
//   galleryImg: 'gallery__img',
//   galleryImgOverlayUpper: 'gallery__overlay-upper',
//   galleryImgOverlay: 'gallery__overlay',
// };

export default function makeImageCard(params) {
  const {
    tags,
    likes,
    views,
    comments,
    downloads,
    preview,
    homePage,
    transpBgClass,
    galleryClassName,
    fileName,
  } = params;

  const { large, middle } = preview;
  const iconsPath = new URL('../images/icons.svg', import.meta.url);
  const linkTarget = 'target="_blank" rel="noopener noreferrer"';

  const makeTagsList = tags =>
    tags
      .split(/\s*,\s*/)
      .map(tag => `<li class="img-tags__item">${tag}</li>`)
      .join('');

  return `
    <li class="${galleryClassName}__item ${transpBgClass}">
      <a class="${galleryClassName}__link" href="${large.url}">
        <img class="${galleryClassName}__img"
          srcset = "${middle.url} 1x, ${large.url} 2x"
          src="${middle.url}"
          alt="${tags}"
          loading="lazy">
      </a>

      <div class="gallery__overlay-upper">
        <ul class="img-tags">${makeTagsList(tags)}</ul>
      </div>
      
      <div class="img-overlay">
        <ul class="img-info">
          <li class="img-info__item" title="Likes: ${likes}">
            <a href="${homePage}" ${linkTarget}>
              <svg><use href="${iconsPath}#icon-heart"></use></svg>
              ${formatNumber(likes)}
            </a>
          </li>
          <li class="img-info__item" title="Comments: ${comments}">
            <a href="${homePage}" ${linkTarget}>
              <svg><use href="${iconsPath}#icon-bubble"></use></svg>
              ${formatNumber(comments)}
            </a>
          </li>
          <li class="img-info__item" title="Views: ${views}">
            <a href="${homePage}" ${linkTarget}>
              <svg><use href="${iconsPath}#icon-eye"></use></svg>
              ${formatNumber(views)}
            </a>
          </li>
          <li class="img-info__item" title="Downloads: ${downloads}">
            <a href="${large.url}" download ${linkTarget}>
              <svg><use href="${iconsPath}#icon-download"></use></svg>
              ${formatNumber(downloads)}
            </a>
          </li>
        </ul>
      </div>
      <a class="gallery__download-btn"
        href="${large.url}"
        title="Save image" ${linkTarget}
        data-filename="${fileName}"
      >
        <svg><use href="${iconsPath}#icon-download-cloud"></use></svg>
      </a>
    </li>`;
}
