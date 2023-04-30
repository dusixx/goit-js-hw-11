// value[?alias]
// defValueIdx: 0

const queryParams = {
  image_type: {
    value: ['?all images', 'photo', 'illustration', 'vector'],
  },

  order: {
    value: ['?most relevant', "ec?editor's choice", 'trending', 'latest'],
  },

  orientation: {
    value: ['?any orientation', 'horizontal', 'vertical'],
  },

  colors: {
    caption: 'Colors',
    colorPalette: true,
    value: [
      'transparent',
      'grayscale',
      'red',
      'orange',
      'yellow',
      'green',
      'turquoise',
      'blue',
      'lilac?mediumorchid',
      'pink',
      'white',
      'gray',
      'black',
      'brown',
    ],
  },

  safesearch: {
    type: 'checkbox',
    checked: true,
    value: 'true',
  },

  per_page: {
    type: 'number',
    min: 20, // 3
    max: 200,
    value: 20,
  },

  // category: [
  //   'backgrounds',
  //   'fashion',
  //   'nature',
  //   'science',
  //   'education',
  //   'feelings',
  //   'health',
  //   'people',
  //   'religion',
  //   'places',
  //   'animals',
  //   'industry',
  //   'computer',
  //   'food',
  //   'sports',
  //   'transportation',
  //   'travel',
  //   'buildings',
  //   'business',
  //   'music',
  // ],
};

export default queryParams;
