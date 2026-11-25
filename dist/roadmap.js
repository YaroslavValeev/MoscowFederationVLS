/* Координаты заданы в процентах от исходной иллюстрации 1983 × 793. */
const roadmapTargets = [
  { label: 'Школа ФВЛС — площадки и обучение', href: 'index.html#school-locations', kind: 'страница', box: [1.3, 18.5, 5.7, 18] },
  { label: 'Выбор дисциплины — правила', href: 'school.html#discipline-rules-heading', kind: 'страница', box: [7.3, 18.5, 6.3, 18] },
  { label: 'Обучение спортсмена — школа ФВЛС', href: 'school.html#tyaga', kind: 'страница', box: [13.8, 18.5, 6.1, 18] },
  { label: 'Первый старт — календарь мероприятий', href: 'index.html#calendar', kind: 'страница', box: [20.4, 18.5, 4.8, 18] },
  { label: 'II юношеский разряд — нормативы ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=9', kind: 'документ', box: [25.5, 18.5, 5.1, 18] },
  { label: 'I юношеский разряд — нормативы ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=9', kind: 'документ', box: [31.3, 18.5, 5.2, 18] },
  { label: 'III спортивный разряд — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=6', kind: 'документ', box: [36.6, 18.5, 4.6, 18] },
  { label: 'II спортивный разряд — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=6', kind: 'документ', box: [41.5, 18.5, 4.7, 18] },
  { label: 'I спортивный разряд — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=6', kind: 'документ', box: [46.4, 18.5, 4.5, 18] },
  { label: 'КМС — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=3', kind: 'документ', box: [51.2, 18.5, 4.8, 18] },
  { label: 'МС — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=4', kind: 'документ', box: [56.2, 18.5, 5.2, 18] },
  { label: 'Сборная Москвы — порядок формирования', href: 'assets/documents/moscow-team-146.pdf#page=2', kind: 'документ', box: [62.3, 18.5, 5.2, 18] },
  { label: 'МСМК — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=1', kind: 'документ', box: [68.8, 18.5, 5.0, 18] },
  { label: 'Заслуженный мастер спорта России — положение', href: 'https://www.consultant.ru/document/cons_doc_LAW_432889/', kind: 'документ', box: [75.1, 18.5, 4.1, 18] },
  { label: 'Почётный мастер спорта России — положение', href: 'https://www.consultant.ru/document/cons_doc_LAW_432889/', kind: 'документ', box: [80.1, 18.5, 5.4, 18] },
  { label: 'Медаль Николая Озерова — положение', href: 'https://www.consultant.ru/document/cons_doc_LAW_340435/123e0700fed77b78e50ac7d80d681f5acb8e34bf/', kind: 'документ', box: [86.6, 18.5, 5.7, 18] },
  { label: 'Орден Почёта — статут', href: 'https://www.consultant.ru/document/cons_doc_LAW_104589/9a0a6c22c1956936b075b293b96081d0b5ccfa43/', kind: 'документ', box: [93.2, 18.5, 5.2, 18] },
  { label: 'Брисбен-2032 — формирование программы Игр', href: 'https://www.olympics.com/ioc/news/brisbane-2032-sports-programme-to-be-finalised-at-147th-ioc-session-in-april-2027', kind: 'страница', box: [69.2, 0.7, 19.5, 11.0] },
  { label: 'U15 — правила и возрастные категории', href: 'school.html#rules-cable-wakeboard', kind: 'страница', box: [24.1, 12.0, 8.8, 6.0] },
  { label: 'U19 — правила и возрастные категории', href: 'school.html#rules-cable-wakeboard', kind: 'страница', box: [35.7, 12.0, 7.7, 6.0] },
  { label: 'Open — правила и возрастные категории', href: 'school.html#rules-cable-wakeboard', kind: 'страница', box: [52.2, 12.0, 10.0, 6.0] },
  { label: 'Masters — правила и возрастные категории', href: 'school.html#rules-cable-wakeboard', kind: 'страница', box: [68.7, 12.0, 9.9, 6.0] },
  { label: 'Veterans — правила и возрастные категории', href: 'school.html#rules-cable-wakeboard', kind: 'страница', box: [83.1, 12.0, 9.7, 6.0] },
  { label: 'Первенство города — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=6', kind: 'документ', box: [26.8, 40.2, 11.8, 10.0] },
  { label: 'Первенство субъекта РФ — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=6', kind: 'документ', box: [39.7, 40.2, 8.4, 10.0] },
  { label: 'Межрегиональные старты — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=3', kind: 'документ', box: [49.0, 40.2, 14.1, 10.0] },
  { label: 'Кубок и чемпионат России — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=4', kind: 'документ', box: [64.2, 40.2, 8.2, 11.8] },
  { label: 'Первенство Европы — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=3', kind: 'документ', box: [73.3, 40.2, 4.2, 10.0] },
  { label: 'Чемпионат Европы — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=2', kind: 'документ', box: [78.4, 40.2, 4.4, 10.0] },
  { label: 'Чемпионат мира — требования ЕВСК', href: 'assets/documents/evsk-waterski-299.pdf#page=1', kind: 'документ', box: [83.8, 40.2, 4.7, 10.0] },
  { label: 'Всемирные игры — водные лыжи и вейкборд', href: 'https://www.theworldgames.org/sports/Waterski-Wakeboard-37', kind: 'страница', box: [89.3, 40.2, 8.8, 10.0] },
  { label: 'Слалом — правила Минспорта', href: 'assets/documents/rules-808.pdf#page=55', kind: 'документ', box: [3.0, 49.3, 5.1, 13.0] },
  { label: 'Фигурное катание — правила Минспорта', href: 'assets/documents/rules-808.pdf#page=67', kind: 'документ', box: [8.3, 49.3, 5.1, 13.0] },
  { label: 'Прыжки с трамплина — правила Минспорта', href: 'assets/documents/rules-808.pdf#page=45', kind: 'документ', box: [13.5, 49.3, 5.4, 13.0] },
  { label: 'Многоборье — правила Минспорта', href: 'assets/documents/rules-808.pdf#page=82', kind: 'документ', box: [19.0, 49.3, 5.5, 13.0] },
  { label: 'Вейкборд за катером — правила Минспорта', href: 'assets/documents/rules-808.pdf#page=83', kind: 'документ', box: [3.0, 63.3, 5.1, 14.1] },
  { label: 'Вейкборд на электротяге — правила Минспорта', href: 'assets/documents/rules-808.pdf#page=83', kind: 'документ', box: [8.3, 63.3, 5.1, 14.1] },
  { label: 'Вейксерф — правила Минспорта', href: 'assets/documents/rules-808.pdf#page=83', kind: 'документ', box: [13.5, 63.3, 5.4, 14.1] },
  { label: 'Скиджоринг — уточнить информацию в федерации', href: 'index.html#contacts', kind: 'страница', box: [19.0, 63.3, 5.5, 14.1] },
  { label: 'Допуск — положение о ЕВСК', href: 'assets/documents/evsk-procedure-173.pdf', kind: 'документ', box: [27.3, 55.0, 12.5, 3.4] },
  { label: 'Приказ о присвоении — положение о ЕВСК', href: 'assets/documents/evsk-procedure-173.pdf', kind: 'документ', box: [27.3, 58.5, 12.5, 3.4] },
  { label: 'Удостоверение — статья 22 закона о спорте', href: 'https://www.consultant.ru/document/cons_doc_LAW_73038/1360fb7fc3ba54b4560c3e087703c73bdba40479/', kind: 'документ', box: [27.3, 62.0, 12.5, 3.4] },
  { label: 'Нагрудный знак — статья 22 закона о спорте', href: 'https://www.consultant.ru/document/cons_doc_LAW_73038/1360fb7fc3ba54b4560c3e087703c73bdba40479/', kind: 'документ', box: [27.3, 65.5, 12.5, 3.4] },
  { label: 'Сборная Москвы — порядок формирования', href: 'assets/documents/moscow-team-146.pdf#page=2', kind: 'документ', box: [27.3, 69.0, 12.5, 3.4] },
  { label: 'Стимулирующие выплаты — рекомендации Москомспорта', href: 'https://base.garant.ru/414210715/53f89421bbdaf741eb2d1ecc4ddb4c33/', kind: 'документ', box: [27.3, 72.5, 12.5, 5.2] },
  { label: 'Партнёры и бартер — коммерческий путь', href: 'index.html#athlete-commercial', kind: 'страница', box: [41.7, 53.0, 17.0, 9.5] },
  { label: 'Образование тренера — профессиональный стандарт', href: 'assets/documents/trainer-362n.pdf', kind: 'документ', box: [41.7, 63.0, 17.0, 8.0] },
  { label: 'Партнёрская программа — коммерческий путь', href: 'index.html#athlete-commercial', kind: 'страница', box: [61.0, 53.0, 12.4, 9.5] },
  { label: 'Коммерческий путь спортсмена', href: 'index.html#athlete-commercial', kind: 'страница', box: [74.0, 53.0, 13.4, 9.5] },
  { label: 'Личный бренд и контент спортсмена', href: 'index.html#athlete-commercial', kind: 'страница', box: [88.8, 53.0, 10.4, 9.5] },
  { label: 'Судейский путь — квалификационные требования', href: 'https://bazanpa.ru/minsport-rossii-prikaz-n532-ot28072023-h6112236/', kind: 'документ', box: [43.8, 71.8, 10.0, 9.5] },
  { label: 'Судья III категории — квалификационные требования', href: 'https://bazanpa.ru/minsport-rossii-prikaz-n532-ot28072023-h6112236/', kind: 'документ', box: [54.2, 71.8, 7.2, 9.5] },
  { label: 'Судья II категории — квалификационные требования', href: 'https://bazanpa.ru/minsport-rossii-prikaz-n532-ot28072023-h6112236/', kind: 'документ', box: [61.5, 71.8, 7.4, 9.5] },
  { label: 'Судья I категории — квалификационные требования', href: 'https://bazanpa.ru/minsport-rossii-prikaz-n532-ot28072023-h6112236/', kind: 'документ', box: [69.0, 71.8, 7.9, 9.5] },
  { label: 'Всероссийская категория судьи — требования', href: 'https://bazanpa.ru/minsport-rossii-prikaz-n532-ot28072023-h6112236/', kind: 'документ', box: [77.1, 71.8, 10.3, 9.5] },
  { label: 'Международный судья — коллегия судей ФВЛС', href: 'https://waterskifed.ru/juri', kind: 'страница', box: [87.7, 71.8, 11.3, 9.5] },
  { label: 'Тренерский путь — профессиональный стандарт', href: 'assets/documents/trainer-362n.pdf', kind: 'документ', box: [43.3, 82.8, 15.7, 12.5] },
  { label: 'Тренер II категории — приказ № 224', href: 'https://www.consultant.ru/document/cons_doc_LAW_352793/', kind: 'документ', box: [59.3, 82.8, 6.6, 12.5] },
  { label: 'Тренер I категории — приказ № 224', href: 'https://www.consultant.ru/document/cons_doc_LAW_352793/', kind: 'документ', box: [66.1, 82.8, 6.2, 12.5] },
  { label: 'Высшая категория тренера — приказ № 224', href: 'https://www.consultant.ru/document/cons_doc_LAW_352793/', kind: 'документ', box: [72.5, 82.8, 5.0, 12.5] },
  { label: 'Старший тренер — профессиональный стандарт', href: 'assets/documents/trainer-362n.pdf', kind: 'документ', box: [77.7, 82.8, 6.0, 12.5] },
  { label: 'Тренер сборной Москвы — критерии отбора', href: 'assets/documents/moscow-team-146.pdf#page=8', kind: 'документ', box: [83.9, 82.8, 6.4, 12.5] },
  { label: 'Заслуженный тренер России — положение о званиях', href: 'https://www.consultant.ru/document/cons_doc_LAW_432889/', kind: 'документ', box: [90.5, 82.8, 8.4, 12.5] }
];

function initRoadmapViewer() {
  const opener = document.querySelector('.roadmap-picture-open');
  const modal = document.querySelector('#roadmap-viewer');
  if (!opener || !modal || typeof modal.showModal !== 'function') return;

  const overlay = modal.querySelector('.roadmap-hotspots');
  const index = modal.querySelector('.roadmap-viewer-index ul');
  const surface = modal.querySelector('.roadmap-map-surface');
  const controls = modal.querySelector('.roadmap-viewer-controls');
  const zoomOut = controls.querySelector('[data-roadmap-zoom="out"]');
  const zoomIn = controls.querySelector('[data-roadmap-zoom="in"]');
  const zoomLabel = controls.querySelector('[data-roadmap-zoom-label]');
  const zoomLevels = [.6, .8, 1, 1.25, 1.5];
  let zoomIndex = 1;

  function setZoom(nextIndex) {
    zoomIndex = Math.max(0, Math.min(zoomLevels.length - 1, nextIndex));
    const scale = zoomLevels[zoomIndex];
    surface.style.setProperty('--roadmap-map-width', `${Math.round(1983 * scale)}px`);
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    zoomOut.disabled = zoomIndex === 0;
    zoomIn.disabled = zoomIndex === zoomLevels.length - 1;
  }

  zoomOut.addEventListener('click', () => setZoom(zoomIndex - 1));
  zoomIn.addEventListener('click', () => setZoom(zoomIndex + 1));
  setZoom(zoomIndex);
  controls.hidden = false;

  for (const item of roadmapTargets) {
    const [left, top, width, height] = item.box;
    const link = document.createElement('a');
    link.className = 'roadmap-hotspot';
    link.href = item.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = `${item.label} — открыть ${item.kind === 'документ' ? 'документ' : 'страницу'}`;
    link.setAttribute('aria-label', link.title);
    Object.assign(link.style, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
    overlay.append(link);

    const entry = document.createElement('li');
    const indexLink = link.cloneNode(false);
    indexLink.removeAttribute('class');
    indexLink.removeAttribute('style');
    indexLink.textContent = item.label;
    entry.append(indexLink);
    index.append(entry);
  }

  opener.addEventListener('click', event => {
    event.preventDefault();
    modal.showModal();
  });
  modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
  modal.addEventListener('close', () => opener.focus({ preventScroll: true }));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRoadmapViewer, { once: true });
else initRoadmapViewer();
