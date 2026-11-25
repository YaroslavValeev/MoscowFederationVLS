/* Цифровые выдержки из приложения № 13 к приказу Минспорта России от 09.04.2026 № 299.
   Значения переписаны из страниц 199–200; требования по местам — из страниц 191–198. */
(() => {
  const result = document.getElementById('evsk-result');
  if (!result) return;

  const ranks = ['МСМК', 'МС', 'КМС', 'I разряд', 'II разряд', 'III разряд', 'I юношеский', 'II юношеский'];
  const scoreRows = pairs => ranks.map((rank, index) => [rank, ...pairs[index]]);
  const ageNote = 'По ЕВСК МСМК выполняется с 15 лет, МС — с 13 лет, КМС — с 11 лет, I–III спортивные и I–II юношеские разряды — с 9 лет.';
  const records = {
    slalom: {
      description: 'Количество буев / скорость катера, км/ч, не менее / длина троса, м, не более.',
      headers: ['Разряд или звание', 'М', 'Ж'],
      rows: scoreRows([['4/58/10,75','3/55/11,25'],['6/58/13','4/55/13'],['4/58/16','3/55/16'],['4/55/18,25','4/52/18,25'],['6/52/18,25','4/49/18,25'],['3/49/18,25','2/46/18,25'],['2/43/18,25','2/40/18,25'],['2/37/18,25','2/34/18,25']]),
      note: ageNote
    },
    jump: {
      description: 'Нормы по дальности прыжка, метры.',
      headers: ['Разряд или звание', 'М', 'Ж'],
      rows: scoreRows([['64,8','50,7'],['46','37'],['36','29'],['31','21'],['25','18'],['20','14'],['16','13'],['13','11']]),
      note: ageNote
    },
    'boat-tricks': {
      description: 'Нормы по фигурному катанию за катером, очки.',
      headers: ['Разряд или звание', 'М', 'Ж'],
      rows: scoreRows([['9 500','7 500'],['5 400','4 300'],['3 100','2 300'],['2 600','1 700'],['1 600','1 100'],['1 100','600'],['600','300'],['300','200']]),
      note: ageNote
    },
    combined: {
      description: 'Нормы по многоборью за катером, очки.',
      headers: ['Звание или разряд', 'М', 'Ж'],
      rows: [['МСМК','187','155'],['МС','120','100'],['КМС','85','75']],
      note: 'Очки в многоборье должны быть набраны на одних спортивных соревнованиях. Трамплин: 1 метр = 1 очко; фигурное катание: 100 очков = 1 очко. Очки в слаломе определяются по таблице в документе. ' + ageNote
    },
    'cable-tricks': {
      description: 'Нормы по фигурному катанию на электротяге, очки.',
      headers: ['Разряд или звание', 'М', 'Ж'],
      rows: scoreRows([['7 900','5 200'],['5 000','4 000'],['3 000','2 200'],['2 500','1 600'],['1 500','1 000'],['1 000','500'],['500','240'],['240','180']]),
      note: ageNote
    },
    'pool-tricks': {
      description: 'Нормы по фигурному катанию в бассейне, очки. Для МСМК ячейки в таблице ЕВСК не заполнены.',
      headers: ['Разряд или звание', 'М', 'Ж'],
      rows: scoreRows([['—','—'],['6 500','5 500'],['3 800','3 000'],['2 700','2 200'],['1 700','1 200'],['1 100','700'],['600','340'],['340','260']]),
      note: ageNote
    },
    wake: {
      description: 'Требование ЕВСК — занять указанное место на соревновании соответствующего статуса и в своей возрастной группе.',
      headers: ['Статус соревнования и категория', 'I', 'II', 'III'],
      rows: [
        ['Другие всероссийские соревнования в ЕКП · мужчины, женщины','6–7','—','—'],
        ['Другие всероссийские соревнования в ЕКП · до 19 лет','4–5','—','—'],
        ['Другие всероссийские соревнования в ЕКП · до 15 лет','3–4','—','—'],
        ['Другие межрегиональные соревнования в ЕКП · мужчины, женщины','4–5','—','—'],
        ['Другие межрегиональные соревнования в ЕКП · до 19 лет','1–3','—','—'],
        ['Другие межрегиональные соревнования в ЕКП · до 15 лет','1–2','—','—'],
        ['Чемпионат субъекта РФ · мужчины, женщины','1–5','—','—'],
        ['Кубок субъекта РФ · мужчины, женщины','1–3','4–5','—'],
        ['Первенство субъекта РФ · до 19 лет','1–3','4–5','6–7'],
        ['Первенство субъекта РФ · до 15 лет','1–2','3–4','5–6'],
        ['Другие официальные соревнования субъекта РФ · мужчины, женщины','1–3','4–5','6–7'],
        ['Другие официальные соревнования субъекта РФ · до 19 лет','1–2','3–4','5–6'],
        ['Другие официальные соревнования субъекта РФ · до 15 лет','1','2–3','4–5'],
        ['Чемпионат муниципального образования · мужчины, женщины','—','1–3','4–6'],
        ['Первенство муниципального образования · до 19 лет','—','1–3','4–5'],
        ['Первенство муниципального образования · до 15 лет','—','1–2','3–4'],
        ['Другие официальные соревнования муниципального образования · мужчины, женщины','—','1–2','3–4'],
        ['Другие официальные соревнования муниципального образования · до 19 лет','—','1–2','3–4'],
        ['Другие официальные соревнования муниципального образования · до 15 лет','—','1','2–3']
      ],
      note: 'I–III разряды выполняются с 9 лет. Для Кубка субъекта при двух и более этапах учитывается финал.'
    },
    poda: {
      description: 'Требование ЕВСК для дисциплины «ПОДА — вейкборд — электротяга»: занять указанное место.',
      headers: ['Статус соревнования и категория', 'I', 'II', 'III'],
      rows: [
        ['Другие всероссийские соревнования в ЕКП · мужчины','3–4','—','—'],
        ['Другие межрегиональные соревнования в ЕКП · мужчины','3–4','—','—'],
        ['Чемпионат субъекта РФ · мужчины','1–3','—','—'],
        ['Другие официальные соревнования субъекта РФ · мужчины','—','1–2','3–4'],
        ['Чемпионат муниципального образования · мужчины','—','—','1–3'],
        ['Другие официальные соревнования муниципального образования · мужчины','—','—','1']
      ],
      note: 'В этих строках указана категория «мужчины». I–III разряды выполняются с 9 лет.'
    }
  };

  // Таблицы по местам: приложение 13, страницы 191–195.
  const msKmsWake = [
    ['Первенство мира · юниоры, юниорки до 19 лет','1–5','—'],
    ['Первенство мира · юноши, девушки до 15 лет','—','1–5'],
    ['Первенство Европы · юниоры, юниорки до 19 лет','1–4','—'],
    ['Первенство Европы · юноши, девушки до 15 лет','—','1–4'],
    ['Другие международные соревнования в ЕКП · мужчины, женщины','1–5','—'],
    ['Другие международные соревнования в ЕКП · до 19 лет','1–3','—'],
    ['Другие международные соревнования в ЕКП · до 15 лет','—','1–3'],
    ['Чемпионат России · мужчины, женщины (строка 1)','1–2*','3–5'],
    ['Чемпионат России · мужчины, женщины (строка 2)','1','2–5'],
    ['Кубок России · мужчины, женщины','1','2–5'],
    ['Первенство России · до 19 лет','—','1–4'],
    ['Первенство России · до 15 лет','—','1–3'],
    ['Другие всероссийские соревнования в ЕКП · мужчины, женщины','—','1–5'],
    ['Другие всероссийские соревнования в ЕКП · до 19 лет','—','1–3'],
    ['Другие всероссийские соревнования в ЕКП · до 15 лет','—','1–2'],
    ['Другие межрегиональные соревнования в ЕКП · мужчины, женщины','—','1–3']
  ];
  const msKmsPoda = [
    ['Другие международные соревнования в ЕКП · мужчины','1–3','—'],
    ['Чемпионат России · мужчины','1*','1'],
    ['Кубок России · мужчины','1*','1'],
    ['Другие всероссийские соревнования в ЕКП · мужчины','—','1–2'],
    ['Другие межрегиональные соревнования в ЕКП · мужчины','—','1–2']
  ];

  function advancedGroups(key, record) {
    const isPoda = key.startsWith('poda');
    const isWakeboard = ['wake-boat', 'wake-cable', 'wake-pool'].includes(key);
    const international = isPoda
      ? [['Чемпионат мира · мужчины','1–2'],['Чемпионат Европы · мужчины','1']]
      : [['Чемпионат мира · мужчины, женщины','1–4'],['Кубок мира · мужчины, женщины','1–2']];
    if (!isPoda && isWakeboard) international.push(['Чемпионат Европы · мужчины, женщины','1–3']);
    return [
      { title: 'I–III спортивные разряды · с 9 лет', headers: record.headers, rows: record.rows, note: record.note, page: 6, pages: '196–198' },
      { title: 'МС и КМС · с 13 и 11 лет', headers: ['Статус соревнования и категория','МС','КМС'], rows: isPoda ? msKmsPoda : msKmsWake,
        note: isPoda
          ? '* Для МС первое место на чемпионате России или Кубке России необходимо занять два года подряд. При двух и более этапах Кубка учитывается финал.'
          : '* Для МС требование по второму месту чемпионата России выполняется дважды в течение трёх лет. В ЕВСК приведены две строки чемпионата России. При двух и более этапах Кубка России учитывается финал.',
        page: 3, pages: '193–195' },
      { title: 'МСМК · с 15 лет', headers: ['Статус соревнования и категория','Место'], rows: international,
        note: isPoda ? 'В указанных строках ЕВСК приведена категория «мужчины».' : 'При двух и более этапах Кубка мира учитывается финал.' + (isWakeboard ? '' : ' В строке чемпионата Европы указаны только вейкборд за катером и на электротяге.'), page: 1, pages: '191–192' }
    ];
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function makeTable(headers, rows) {
    const wrap = element('div', '', 'evsk-table-wrap');
    const table = element('table', '', 'evsk-table');
    table.append(element('caption', 'Выдержка из ЕВСК'));
    const head = table.createTHead().insertRow();
    headers.forEach(label => { const cell = element('th', label); cell.scope = 'col'; head.append(cell); });
    const body = table.createTBody();
    rows.forEach(row => {
      const tr = body.insertRow();
      row.forEach((value, index) => {
        const cell = element(index === 0 ? 'th' : 'td', value);
        if (index === 0) cell.scope = 'row';
        tr.append(cell);
      });
    });
    wrap.append(table);
    return wrap;
  }

  const choices = [];
  document.querySelectorAll('a[data-evsk]').forEach(link => {
    const key = link.dataset.evsk;
    const isPool = key.endsWith('-pool');
    const recordKey = key.startsWith('wake-') ? 'wake' : key.startsWith('poda') ? 'poda' : key;
    const record = records[recordKey];
    if (!record) return;
    const button = element('button', link.textContent, 'evsk-choice');
    button.type = 'button';
    button.setAttribute('aria-controls', 'evsk-result');
    button.setAttribute('aria-pressed', 'false');
    button.dataset.evskChoice = key;
    choices.push(button);
    button.addEventListener('click', () => {
      choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      result.replaceChildren(element('h5', button.textContent), element('p', record.description));
      if (isPool) result.append(element('p', 'В этой таблице ЕВСК отдельной строки для вейкборда в бассейне нет. Приведена строка для электротяги; возможность выполнения на конкретном старте в бассейне уточните у организатора и федерации.'));
      if (recordKey === 'wake' || recordKey === 'poda') {
        result.append(element('p', 'Выберите разряд или звание. «—» означает, что в этой строке ЕВСК требование не указано. Возраст должен быть достигнут в календарном году соревнования.'));
        const groups = element('div', '', 'evsk-rank-groups');
        advancedGroups(key, record).forEach(group => {
          const details = element('details', '', 'evsk-rank-group');
          details.append(element('summary', group.title), makeTable(group.headers, group.rows), element('p', group.note));
          const citation = element('a', `ЕВСК · страницы ${group.pages} · PDF`, 'text-link');
          citation.href = `assets/documents/evsk-waterski-299.pdf#page=${group.page}`;
          citation.target = '_blank';
          citation.rel = 'noopener noreferrer';
          details.append(citation);
          groups.append(details);
        });
        result.append(groups);
      } else {
        result.append(makeTable(record.headers, record.rows), element('p', record.note));
      }
      const source = element('a', 'Открыть строку в ЕВСК · PDF', 'text-link');
      source.href = link.href;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      result.append(source);
    });
    link.replaceWith(button);
  });

  function openLinkedDetails() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    const disclosure = target.querySelector(':scope > details.athlete-disclosure');
    if (disclosure) disclosure.open = true;
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
  }
  window.addEventListener('hashchange', openLinkedDetails);
  openLinkedDetails();
})();
