//
//value[?alias]
//
// defaults:
// value index == 0
// nodeName: 'button',
// nodeType: 'button',
//

export default queryParams = {
  image_type: {
    caption: 0,
    value: ['?all images', 'photo', 'illustration', 'vector'],
  },

  order: {
    caption: 0,
    value: ['?Most relevant', "ec?Editor's choice", 'trending', 'latest'],
  },

  orientation: {
    caption: 0,
    value: ['?any orientation', 'horizontal', 'vertical'],
  },

  colors: {
    multiselect: true,
    isColorPalette: true,
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
    nodeType: 'checkbox',
    value: ['true'],
  },

  // order: {
  //   value: ['popular', 'latest'],
  // },

  // editorsChoice: {
  //   caption: "Editor's choice",
  //   value: ['false', 'true'],
  // },

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

// const searchParams = (
//   'q key lang id image_type orientation category min_width min_height ' +
//   'colors editors_choice safesearch order page per_page'
// ).split(' ');
