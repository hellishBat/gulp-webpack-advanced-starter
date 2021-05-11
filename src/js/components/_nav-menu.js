// Nav menu
let navBtn = document.querySelector('.js-nav-btn');
let navMenu = document.querySelector('.js-nav-menu');
let navLinks = document.querySelectorAll('.header__link');
let body = document.querySelector('body');
var i;

export const closeNav = () => {
  navBtn.classList.remove('active');
  navMenu.classList.remove('active');
  navMenu.classList.remove('active');
  body.classList.remove('lock');
}

export const openNav = () => {
  navBtn.classList.add('active');
  navMenu.classList.add('active');
  body.classList.add('lock');
}

export const toggleNav = () => {
  if (navBtn.classList.contains('active')) {
    closeNav();

  } else {
    openNav();
  }
}

navBtn.addEventListener('click', () => {
  toggleNav();
});


for (i=0; i < navLinks.length; ++i) {
  navLinks[i].addEventListener('click', () => {
    closeNav();
  });
}
