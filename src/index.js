import './sass/index.scss';
// import './sass/main.scss';
// import axios from 'axios';
// import { Notify } from 'notiflix';
// import simpleLightbox from 'simplelightbox';

const searchFormRef = document.querySelector('.search-form');
const searchInputRef = document.querySelector('.search-form__input');
const clearInputBtnRef = document.querySelector('.search-form__btn-clear');

clearInputBtnRef.addEventListener('click', e => {
  searchInputRef.value = '';
  // чтобы не слетал outline
  searchInputRef.focus();
});

searchInputRef.addEventListener('focus', e => {
  //   e.currentTarget.select();
});

searchFormRef.addEventListener('submit', e => {
  e.preventDefault();
});
