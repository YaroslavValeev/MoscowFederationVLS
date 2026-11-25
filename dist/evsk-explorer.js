/* Цифровые выдержки из приложения № 13 к приказу Минспорта России от 09.04.2026 № 299.
   Значения переписаны из страниц 199–200; требования по местам — из страницы 197. */
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
      description: 'Требование ЕВСК — занять указанное место. В документе эти строки общие для вейкборда за катером и на электротяге, а также катера — доски короткой и длинной.',
      headers: ['Статус соревнования и категория', 'I', 'II', 'III'],
      rows: [
        ['Чемпионат субъекта РФ · мужчины, женщины','1–5','—','—'],
        ['Кубок субъекта РФ · мужчины, женщины','1–3','4–5','—'],
        ['Первенство субъекта РФ · до 19 лет','1–3','4–5','6–7'],
        ['Первенство субъекта РФ · до 15 лет','1–2','3–4','5–6'],
        ['Другие официальные соревнования субъекта РФ · мужчины, женщины','1–3','4–5','6–7'],
        ['Другие официальные соревнования субъекта РФ · до 19 лет','1–2','3–4','5–6'],
        ['Другие официальные соревнования субъекта РФ · до 15 лет','1','2–3','4–5']
      ],
      note: 'I–III разряды выполняются с 9 лет. Для Кубка субъекта при двух и более этапах учитывается финал. Показан фрагмент таблицы; другие статусы и условия смотрите в ЕВСК.'
    },
    poda: {
      description: 'Требование ЕВСК для дисциплины «ПОДА — вейкборд — электротяга»: занять указанное место.',
      headers: ['Статус соревнования и категория', 'I', 'II', 'III'],
      rows: [['Чемпионат субъекта РФ · мужчины','1–3','—','—'],['Другие официальные соревнования субъекта РФ · мужчины','—','1–2','3–4']],
      note: 'В этих строках указана категория «мужчины». I–III разряды выполняются с 9 лет. Показан фрагмент таблицы; другие статусы и условия смотрите в ЕВСК.'
    }
  };

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  const choices = [];
  document.querySelectorAll('a[data-evsk]').forEach(link => {
    const key = link.dataset.evsk;
    const isPool = key.endsWith('-pool');
    const record = records[isPool ? key.replace('-pool', '') : key];
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
      const wrap = element('div', '', 'evsk-table-wrap');
      const table = element('table', '', 'evsk-table');
      table.append(element('caption', 'Выдержка из ЕВСК'));
      const head = table.createTHead().insertRow();
      record.headers.forEach(label => { const cell = element('th', label); cell.scope = 'col'; head.append(cell); });
      const body = table.createTBody();
      record.rows.forEach(row => {
        const tr = body.insertRow();
        row.forEach((value, index) => {
          const cell = element(index === 0 ? 'th' : 'td', value);
          if (index === 0) cell.scope = 'row';
          tr.append(cell);
        });
      });
      wrap.append(table);
      result.append(wrap, element('p', record.note));
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
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
  }
  window.addEventListener('hashchange', openLinkedDetails);
  openLinkedDetails();
})();
