// Header
// Hide header on scroll
let prevScrollPos = window.scrollY || document.scrollTop;
let curScrollPos;
let direction = 0;
let prevDirection = 0;
const header = document.querySelector(".header");

export const checkScroll = () => {
  /*
   ** Find the direction of scroll
   ** 0 - initial, 1 - up, 2 - down
   */
  curScrollPos = window.scrollY || document.scrollTop;
  if (curScrollPos > prevScrollPos) {
    //scrolled up
    direction = 2;
  } else if (curScrollPos < prevScrollPos) {
    //scrolled down
    direction = 1;
  }
  if (direction !== prevDirection) {
    hideHeader(direction, curScrollPos);
  }
  prevScrollPos = curScrollPos;
};

export const hideHeader = (direction, curScroll) => {
  if (direction === 2 && curScroll > header.offsetHeight) {
    // header.classList.add('is-hidden');
    header.style.transform = "translateY(-100%)"
    prevDirection = direction;
  } else if (direction === 1) {
    // header.classList.remove('is-hidden');
    header.style.transform = "translateY(0)"
    prevDirection = direction;
  }
};

window.addEventListener('scroll', checkScroll);
