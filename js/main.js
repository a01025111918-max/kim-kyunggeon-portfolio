// 포트폴리오 데이터를 불러오고 각 섹션 렌더 함수를 순서대로 실행합니다.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('./data/portfolio.json');

    if (!response.ok) {
      throw new Error(`데이터를 불러오지 못했습니다. 상태 코드: ${response.status}`);
    }

    const portfolio = await response.json();

    renderHero(portfolio.hero);
    renderAbout(portfolio.about);
    renderTechStack(portfolio.techStack);
    renderProjects(portfolio.projects);
    renderExperience(portfolio.experience);
    renderContact(portfolio.contact);
  } catch (error) {
    console.error('포트폴리오 초기화 중 오류가 발생했습니다.', error);
  }
});
