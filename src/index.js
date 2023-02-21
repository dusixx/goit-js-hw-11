import './css/styles.css';
// import './sass/main.scss';
// import axios from 'axios';
// import { Notify } from 'notiflix';
// import simpleLightbox from 'simplelightbox';

const searchInputRef = document.querySelector('.search-form__input');
const clearInputBtnRef = document.querySelector('.search-form__btn-clear');

clearInputBtnRef.addEventListener('click', e => {
  searchInputRef.value = '';
});

searchInputRef.addEventListener('focus', e => {
  //   e.currentTarget.select();
});
