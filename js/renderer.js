// HTML 문자열 삽입 시 데이터가 태그로 해석되지 않도록 변환합니다.
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// 기술 숙련도를 1~5 범위로 정리합니다.
function normalizeLevel(level) {
  const parsedLevel = Number(level);

  if (Number.isNaN(parsedLevel)) {
    return 0;
  }

  return Math.min(Math.max(parsedLevel, 0), 5);
}

// 프로젝트 이미지 경로처럼 절대 경로로 들어온 값을 상대 경로로 보정합니다.
function toRelativeAssetPath(path) {
  const safePath = String(path ?? '').trim();

  if (safePath.startsWith('/')) {
    return `.${safePath}`;
  }

  return safePath;
}

// 실제 오픈채팅 주소가 생기면 이 상수만 교체하면 됩니다.
const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/sAjGV05h';

// Hero 섹션을 렌더링할 함수입니다.
function renderHero(hero) {
  const heroSection = document.querySelector('#hero .section-inner');

  if (!heroSection || !hero) {
    return;
  }

  const name = escapeHtml(hero.name);
  const nameEn = escapeHtml(hero.nameEn);
  const tagline = escapeHtml(hero.tagline);
  const subTagline = escapeHtml(hero.subTagline);
  const primaryLabel = escapeHtml(hero.ctaPrimary?.label);
  const primaryHref = escapeHtml(hero.ctaPrimary?.href);
  const secondaryLabel = escapeHtml(hero.ctaSecondary?.label);
  const secondaryHref = escapeHtml(hero.ctaSecondary?.href);
  const primaryIsExternal = /^https?:\/\//.test(String(hero.ctaPrimary?.href || ''));

  const primaryCta = hero.ctaPrimary
    ? `<a class="hero-cta hero-cta-primary" href="${primaryHref}"${primaryIsExternal ? ' target="_blank" rel="noopener noreferrer"' : ' download'}>${primaryLabel}</a>`
    : '';
  const secondaryCta = hero.ctaSecondary
    ? `<a class="hero-cta hero-cta-secondary" href="${secondaryHref}" target="_blank" rel="noopener noreferrer">${secondaryLabel}</a>`
    : '';
  const scrollIndicator = hero.scrollIndicator
    ? `
      <a class="hero-scroll-indicator" href="#about" aria-label="About 섹션으로 이동">
        <span class="hero-scroll-arrow" aria-hidden="true"></span>
      </a>
    `
    : '';

  heroSection.innerHTML = `
    <div class="hero-content">
      <p class="hero-name-en">${nameEn}</p>
      <h1 class="hero-name">${name}</h1>
      <p class="hero-tagline">${tagline}</p>
      <p class="hero-subtagline">${subTagline}</p>
      <div class="hero-cta-group" aria-label="주요 링크">
        ${primaryCta}
        ${secondaryCta}
      </div>
      ${scrollIndicator}
    </div>
  `;
}

// About 섹션을 렌더링할 함수입니다.
function renderAbout(about) {
  const aboutSection = document.querySelector('#about .section-inner');

  if (!aboutSection || !about) {
    return;
  }

  const summary = escapeHtml(about.summary).replaceAll('\n', '<br>');
  const profileImage = escapeHtml(toRelativeAssetPath(about.profileImage));
  const availableLabel = escapeHtml(about.availableLabel);
  const keywordTags = Array.isArray(about.keywords)
    ? about.keywords.map((keyword) => `<li class="about-keyword">${escapeHtml(keyword)}</li>`).join('')
    : '';
  const imageMarkup = profileImage
    ? `<img class="about-profile-image" src="${profileImage}" alt="김경호 프로필 이미지" loading="lazy">`
    : '';
  const fallbackClass = profileImage ? '' : ' is-fallback';
  const availableBadge = about.availableForWork
    ? `
      <div class="about-available-badge" aria-label="${availableLabel}">
        <span class="about-available-dot" aria-hidden="true"></span>
        <span>${availableLabel}</span>
      </div>
    `
    : '';

  aboutSection.innerHTML = `
    <div class="about-grid">
      <div class="about-profile">
        <div class="about-image-wrap${fallbackClass}">
          ${imageMarkup}
          <span class="about-image-fallback" aria-hidden="true">KH</span>
        </div>
        ${availableBadge}
      </div>
      <div class="about-content">
        <p class="about-eyebrow">About</p>
        <h2 class="about-title">서비스를 끝까지 연결하는 개발자</h2>
        <p class="about-summary">${summary}</p>
        <ul class="about-keywords" aria-label="핵심 역량 키워드">
          ${keywordTags}
        </ul>
      </div>
    </div>
  `;

  // 이미지 로딩에 실패하면 이니셜 fallback을 보여줍니다.
  const profileImageElement = aboutSection.querySelector('.about-profile-image');
  const imageWrap = aboutSection.querySelector('.about-image-wrap');

  if (profileImageElement && imageWrap) {
    profileImageElement.addEventListener('error', () => {
      imageWrap.classList.add('is-fallback');
      profileImageElement.remove();
    });
  }
}

// Tech Stack 섹션을 렌더링할 함수입니다.
function renderTechStack(techStack) {
  const techSection = document.querySelector('#tech-stack .section-inner');
  const categories = Array.isArray(techStack?.categories) ? techStack.categories : [];

  if (!techSection || categories.length === 0) {
    return;
  }

  const categoryGroups = categories.map((category) => {
    const items = Array.isArray(category.items) ? category.items : [];
    const itemCards = items.map((item) => {
      const level = normalizeLevel(item.level);
      const levelLabel = escapeHtml(techStack.levelGuide?.[level] || '');
      const note = escapeHtml(item.note);

      return `
        <li class="tech-item">
          <div class="tech-item-header">
            <span class="tech-name">${escapeHtml(item.name)}</span>
            <span class="tech-level-label">${levelLabel}</span>
          </div>
          ${note ? `<p class="tech-item-note">${note}</p>` : ''}
        </li>
      `;
    }).join('');

    return `
      <section class="tech-category" aria-labelledby="tech-category-${escapeHtml(category.name).replaceAll(' ', '-').replaceAll('/', '-')}">
        <h3 class="tech-category-title" id="tech-category-${escapeHtml(category.name).replaceAll(' ', '-').replaceAll('/', '-')}">${escapeHtml(category.name)}</h3>
        <ul class="tech-list">
          ${itemCards}
        </ul>
      </section>
    `;
  }).join('');

  techSection.innerHTML = `
    <div class="tech-stack-content">
      <div class="section-heading">
        <p class="section-eyebrow">Tech Stack</p>
        <h2 class="section-title">실제로 써본 기술을 기준으로 정리했습니다</h2>
      </div>
      <div class="tech-category-grid">
        ${categoryGroups}
      </div>
    </div>
  `;
}

// Projects 섹션을 렌더링할 함수입니다.
function renderProjects(projects) {
  const projectsSection = document.querySelector('#projects .section-inner');
  const projectItems = Array.isArray(projects) ? projects : [];

  if (!projectsSection || projectItems.length === 0) {
    return;
  }

  const cards = projectItems.map((project, index) => {
    const thumbnail = escapeHtml(toRelativeAssetPath(project.thumbnail));
    const primaryTech = escapeHtml(project.techStack?.[0] || 'Project');
    const cardTitle = escapeHtml(project.cardTitle || project.title);
    const cardDescription1 = escapeHtml(project.description1 || project.period || '');
    const cardDescription3 = escapeHtml(project.description3 || '');
    const showMobileMockup = project.showMobileMockup !== false;
    const teamBadge = Number(project.teamSize) === 1
      ? '개인 프로젝트'
      : '팀 프로젝트';
    const deviceImageMarkup = thumbnail
      ? `<img class="project-card-image" src="${thumbnail}" alt="${escapeHtml(project.title)} 반응형 화면" loading="lazy">`
      : '';
    const highlights = project.highlights
      ? `<blockquote class="project-highlight">${escapeHtml(project.highlights)}</blockquote>`
      : '';

    return `
      <button class="project-card" type="button" data-project-index="${index}">
        <span class="project-thumb${thumbnail ? '' : ' is-fallback'}" aria-hidden="true">
          <span class="project-device-showcase${showMobileMockup ? '' : ' is-desktop-only'}">
            <span class="project-device project-device-desktop">
              <span class="project-device-bar"></span>
              <span class="project-device-screen">
                ${deviceImageMarkup}
                <span class="project-thumb-fallback">${primaryTech}</span>
              </span>
              <span class="project-device-stand"></span>
            </span>
            ${
              showMobileMockup
                ? `
                  <span class="project-device project-device-phone">
                    <span class="project-device-phone-speaker"></span>
                    <span class="project-device-screen">
                      ${deviceImageMarkup}
                      <span class="project-thumb-fallback">${primaryTech}</span>
                    </span>
                  </span>
                `
                : ''
            }
          </span>
        </span>
        <span class="project-card-body">
          <span class="project-meta-row">
            <span class="project-team-badge">${teamBadge}</span>
          </span>
          <span class="project-title">${cardTitle}</span>
          <span class="project-subtitle">${escapeHtml(project.subtitle)}</span>
          <span class="project-card-description">${cardDescription1}</span>
          <span class="project-card-description">${cardDescription3}</span>
          ${highlights}
        </span>
      </button>
    `;
  }).join('');

  projectsSection.innerHTML = `
    <div class="projects-content">
      <div class="section-heading">
        <p class="section-eyebrow">Projects</p>
        <h2 class="section-title">배포와 운영 흐름까지 직접 다룬 프로젝트</h2>
      </div>
      <div class="project-grid">
        ${cards}
      </div>
      <div class="project-modal" data-project-modal aria-hidden="true">
        <div class="project-modal-backdrop" data-project-close></div>
        <article class="project-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
          <button class="project-modal-close" type="button" data-project-close aria-label="프로젝트 상세 닫기">×</button>
          <div class="project-modal-content" data-project-modal-content></div>
        </article>
      </div>
    </div>
  `;

  const modal = projectsSection.querySelector('[data-project-modal]');
  const modalContent = projectsSection.querySelector('[data-project-modal-content]');
  const closeButtons = projectsSection.querySelectorAll('[data-project-close]');

  function getProjectLinks(project) {
    const links = [
      { label: '서비스 시작', href: project.liveUrl },
      { label: '데모 영상', href: project.demoVideo },
      { label: 'GitHub 보기', href: project.github },
    ];

    return links.filter((link) => String(link.href ?? '').trim() !== '');
  }

  function createProjectModalMarkup(project) {
    const thumbnail = escapeHtml(toRelativeAssetPath(project.thumbnail));
    const architectureDiagram = escapeHtml(toRelativeAssetPath(project.architectureDiagram));
    const primaryTech = escapeHtml(project.techStack?.[0] || 'Project');
    const thumbnailMarkup = thumbnail
      ? `<img class="project-modal-image" src="${thumbnail}" alt="${escapeHtml(project.title)} 썸네일" loading="lazy">`
      : '';
    const architectureMarkup = architectureDiagram
      ? `
        <figure class="project-architecture">
          <img src="${architectureDiagram}" alt="${escapeHtml(project.title)} 아키텍처 다이어그램" loading="lazy">
        </figure>
      `
      : '';
    const featureItems = Array.isArray(project.features)
      ? project.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')
      : '';
    const techTags = Array.isArray(project.techStack)
      ? project.techStack.map((tech) => `<span class="project-tech-tag">${escapeHtml(tech)}</span>`).join('')
      : '';
    const unavailableNote = project.unavailableNote
      ? `<p class="project-unavailable-note">${escapeHtml(project.unavailableNote)}</p>`
      : '';
    const linkButtons = getProjectLinks(project).map((link, index) => {
      const buttonClass = index === 0 ? ' project-link-primary' : '';

      return `
        <a class="project-link${buttonClass}" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(link.label)}
        </a>
      `;
    }).join('');

    return `
      <div class="project-modal-thumb${thumbnail ? '' : ' is-fallback'}">
        ${thumbnailMarkup}
        <span class="project-thumb-fallback">${primaryTech}</span>
      </div>
      <div class="project-modal-header">
        <p class="project-modal-subtitle">${escapeHtml(project.subtitle)}</p>
        <h3 class="project-modal-title" id="project-modal-title">${escapeHtml(project.title)}</h3>
        <div class="project-modal-meta">
          <span>${escapeHtml(project.period)}</span>
          <span>${escapeHtml(project.role)}</span>
        </div>
      </div>
      <p class="project-modal-description">${escapeHtml(project.description)}</p>
      <ul class="project-feature-list">
        ${featureItems}
      </ul>
      ${architectureMarkup}
      <div class="project-tech-list project-modal-tech">
        ${techTags}
      </div>
      ${unavailableNote}
      <div class="project-links">
        ${linkButtons}
      </div>
    `;
  }

  function openProjectModal(project) {
    modalContent.innerHTML = createProjectModalMarkup(project);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    modalContent.querySelectorAll('img').forEach((image) => {
      image.addEventListener('error', () => {
        const imageContainer = image.closest('.project-modal-thumb');

        if (imageContainer) {
          imageContainer.classList.add('is-fallback');
        } else {
          image.closest('figure')?.remove();
        }

        image.remove();
      });
    });
  }

  function closeProjectModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  projectsSection.querySelectorAll('[data-project-index]').forEach((card) => {
    card.addEventListener('click', () => {
      openProjectModal(projectItems[Number(card.dataset.projectIndex)]);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeProjectModal);
  });

  modal.addEventListener('click', (event) => {
    if (!event.target.closest('.project-modal-dialog')) {
      closeProjectModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeProjectModal();
    }
  });

  projectsSection.querySelectorAll('.project-card-image').forEach((image) => {
    image.addEventListener('error', () => {
      const thumbnail = image.closest('.project-thumb');
      thumbnail?.classList.add('is-fallback');
      image.remove();
    });
  });
}

// Experience 섹션을 렌더링할 함수입니다.
function renderExperience(experience) {
  const experienceSection = document.querySelector('#experience .section-inner');

  if (!experienceSection || !experience) {
    return;
  }

  function renderExperienceCards(items, type) {
    const list = Array.isArray(items) ? items : [];

    if (list.length === 0) {
      return '<p class="experience-empty">아직 등록된 내용이 없습니다.</p>';
    }

    return `
      <div class="experience-card-grid">
        ${list.map((item) => {
          const title = type === 'training' ? item.courseName : item.institution;
          const subtitle = type === 'training'
            ? item.institution
            : [item.major, item.degree].filter(Boolean).join(' · ');
          const hours = item.hours ? `<span class="experience-pill">총 ${escapeHtml(item.hours)}</span>` : '';
          const note = item.note ? `<p class="experience-note">${escapeHtml(item.note)}</p>` : '';
          const skills = Array.isArray(item.skills)
            ? item.skills.map((skill) => `<span class="experience-skill">${escapeHtml(skill)}</span>`).join('')
            : '';

          return `
            <article class="experience-card">
              <div class="experience-card-head">
                <div>
                  <p class="experience-period">${escapeHtml(item.period)}</p>
                  <h3 class="experience-card-title">${escapeHtml(title)}</h3>
                  <p class="experience-card-subtitle">${escapeHtml(subtitle)}</p>
                </div>
                <div class="experience-card-badges">
                  <span class="experience-pill">${escapeHtml(item.status)}</span>
                  ${hours}
                </div>
              </div>
              ${skills ? `<div class="experience-skills">${skills}</div>` : ''}
              ${note}
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderCertifications(items) {
    const list = Array.isArray(items) ? items : [];

    if (list.length === 0) {
      return '<p class="experience-empty">아직 등록된 자격증이 없습니다.</p>';
    }

    return `
      <div class="certification-grid">
        ${list.map((item) => `
          <article class="certification-card">
            <span class="certification-icon" aria-hidden="true">🏆</span>
            <div>
              <h3 class="certification-title">${escapeHtml(item.name)}</h3>
              <p class="certification-meta">${escapeHtml(item.issuer)}</p>
              <p class="certification-date">${escapeHtml(item.date)} · ${escapeHtml(item.status)}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderActivities(items) {
    const list = Array.isArray(items)
      ? items.filter((item) => item.title || item.period || item.description)
      : [];

    if (list.length === 0) {
      return '';
    }

    return `
      <div class="activity-list">
        ${list.map((item) => `
          <article class="activity-card">
            <p class="experience-period">${escapeHtml(item.period)}</p>
            <h3 class="experience-card-title">${escapeHtml(item.title)}</h3>
            <p class="activity-description">${escapeHtml(item.description)}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  const activityMarkup = renderActivities(experience.activities);

  experienceSection.innerHTML = `
    <div class="experience-content">
      <div class="section-heading">
        <p class="section-eyebrow">Experience</p>
        <h2 class="section-title">학습과 실무형 훈련으로 쌓은 성장 기록</h2>
      </div>
      <div class="experience-group-grid">
        <section class="experience-group">
          <h3 class="experience-group-title">교육</h3>
          ${renderExperienceCards(experience.training, 'training')}
        </section>
        <section class="experience-group">
          <h3 class="experience-group-title">학력</h3>
          ${renderExperienceCards(experience.education, 'education')}
        </section>
        <section class="experience-group">
          <h3 class="experience-group-title">자격증</h3>
          ${renderCertifications(experience.certifications)}
        </section>
        ${
          activityMarkup
            ? `
              <section class="experience-group">
                <h3 class="experience-group-title">활동</h3>
                ${activityMarkup}
              </section>
            `
            : '<!-- 활동 내역은 실제 데이터가 생기면 다시 표시합니다. -->'
        }
      </div>
    </div>
  `;
}

// Contact 섹션을 렌더링할 함수입니다.
function renderContact(contact) {
  const contactSection = document.querySelector('#contact .section-inner');

  if (!contactSection || !contact) {
    return;
  }

  const email = escapeHtml(contact.email);
  const phone = escapeHtml(contact.phone);
  const github = escapeHtml(contact.github);
  const linkedin = escapeHtml(contact.linkedin);
  const blog = escapeHtml(contact.blog);
  const placeholders = contact.formPlaceholder || {};
  const contactLinks = [
    email
      ? `<a class="contact-link" href="mailto:${email}"><span class="contact-icon" aria-hidden="true">@</span><span>${email}</span></a>`
      : '',
    phone
      ? `<a class="contact-link" href="tel:${phone.replaceAll('-', '')}"><span class="contact-icon" aria-hidden="true">☎</span><span>${phone}</span></a>`
      : '',
    github
      ? `<a class="contact-link" href="${github}" target="_blank" rel="noopener noreferrer"><span class="contact-icon" aria-hidden="true">GH</span><span>GitHub</span></a>`
      : '',
    `<a class="contact-link contact-link-kakao" href="${KAKAO_OPEN_CHAT_URL}" target="_blank" rel="noopener noreferrer" aria-label="카카오톡 오픈채팅으로 문의하기"><span class="contact-icon contact-icon-kakao" aria-hidden="true">💬</span><span>카카오톡 오픈채팅</span></a>`,
    linkedin
      ? `<a class="contact-link" href="${linkedin}" target="_blank" rel="noopener noreferrer"><span class="contact-icon" aria-hidden="true">in</span><span>LinkedIn</span></a>`
      : '',
    blog
      ? `<a class="contact-link" href="${blog}" target="_blank" rel="noopener noreferrer"><span class="contact-icon" aria-hidden="true">B</span><span>Blog</span></a>`
      : '',
  ].join('');
  const formMarkup = contact.formEnabled
    ? `
      <form class="contact-form" novalidate>
        <label class="contact-field">
          <span class="contact-label">${escapeHtml(placeholders.name || '이름')}</span>
          <input type="text" name="name" placeholder="${escapeHtml(placeholders.name || '이름')}" autocomplete="name" required>
          <span class="contact-error" data-error-for="name"></span>
        </label>
        <label class="contact-field">
          <span class="contact-label">${escapeHtml(placeholders.email || '이메일')}</span>
          <input type="email" name="email" placeholder="${escapeHtml(placeholders.email || '이메일')}" autocomplete="email" required>
          <span class="contact-error" data-error-for="email"></span>
        </label>
        <label class="contact-field">
          <span class="contact-label">${escapeHtml(placeholders.message || '메시지')}</span>
          <textarea name="message" placeholder="${escapeHtml(placeholders.message || '메시지를 입력해 주세요')}" rows="6" required></textarea>
          <span class="contact-error" data-error-for="message"></span>
        </label>
        <button class="contact-submit" type="submit">${escapeHtml(placeholders.submit || '보내기')}</button>
        <p class="contact-response-note">${escapeHtml(contact.responseNote)}</p>
        <p class="contact-success" role="status" aria-live="polite"></p>
      </form>
    `
    : '';

  contactSection.innerHTML = `
    <div class="contact-content">
      <div class="contact-info">
        <div class="section-heading">
          <p class="section-eyebrow">Contact</p>
          <h2 class="section-title">함께 일할 기회를 기다리고 있습니다</h2>
        </div>
        <p class="contact-description">프로젝트, 채용, 협업 관련 문의는 아래 연락처로 편하게 남겨주세요.</p>
        <div class="contact-links" aria-label="연락처 목록">
          ${contactLinks}
        </div>
      </div>
      ${formMarkup}
    </div>
  `;

  const form = contactSection.querySelector('.contact-form');

  if (!form) {
    return;
  }

  function setError(fieldName, message) {
    const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const senderEmail = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const successMessage = form.querySelector('.contact-success');
    let isValid = true;

    setError('name', '');
    setError('email', '');
    setError('message', '');

    if (!name) {
      setError('name', '이름을 입력해 주세요.');
      isValid = false;
    }

    if (!senderEmail || !validateEmail(senderEmail)) {
      setError('email', '올바른 이메일을 입력해 주세요.');
      isValid = false;
    }

    if (message.length < 10) {
      setError('message', '메시지는 10자 이상 입력해 주세요.');
      isValid = false;
    }

    if (!isValid) {
      if (successMessage) {
        successMessage.textContent = '';
      }
      return;
    }

    const subject = encodeURIComponent(`[Portfolio] ${name}님의 문의`);
    const body = encodeURIComponent(`이름: ${name}\n이메일: ${senderEmail}\n\n${message}`);

    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;

    if (successMessage) {
      successMessage.textContent = '메일 앱을 열었습니다. 전송 전 내용을 한 번 확인해 주세요.';
    }
  });
}
