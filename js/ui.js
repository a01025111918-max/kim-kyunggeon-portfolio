// 모바일 내비게이션 메뉴를 열고 닫습니다.
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');

    document.body.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// 현재 보이는 섹션에 맞춰 내비게이션 링크를 강조합니다.
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const activeLink = document.querySelector(`.nav-menu a[href="#${entry.target.id}"]`);

    navLinks.forEach((link) => {
      link.classList.remove('active', 'is-active');
    });

    if (activeLink) {
      activeLink.classList.add('active', 'is-active');
    }
  });
}, {
  rootMargin: '-45% 0px -45% 0px',
  threshold: 0,
});

document.querySelectorAll('[data-section]').forEach((section) => {
  sectionObserver.observe(section);
});

// 스크롤로 요소가 화면에 들어오면 fade-in 애니메이션을 적용합니다.
const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.15,
});

document.querySelectorAll('.fade-in').forEach((element) => {
  fadeObserver.observe(element);
});
