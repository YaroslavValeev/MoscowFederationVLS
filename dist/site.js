const header = document.querySelector('.site-header');
const nav = document.querySelector('#main-nav');
const menuToggle = document.querySelector('[data-menu-toggle]');
const disciplineButtons = [...document.querySelectorAll('[data-discipline]')];
const venueSearch = document.querySelector('#venue-search');
const venueGrid = document.querySelector('#venue-grid');
const otherVenues = [...venueGrid.querySelectorAll('[data-venue]')];
const directory = document.querySelector('#city-spots');
const directorySpots = [...directory.querySelectorAll('[data-spot]')];
const emptyCatalog = document.querySelector('#catalog-empty');
const resultsStatus = document.querySelector('#venue-count');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

nav.classList.add('is-collapsible');
menuToggle.hidden = false;
menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target) && nav.classList.contains('is-open')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    menuToggle.focus();
  }
});

function markSelected(buttons, selected) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
}

function normalizeSearch(text) {
  return text.toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ').trim();
}

function filterEntries(entries, discipline, query) {
  let count = 0;
  for (const entry of entries) {
    const hasDiscipline = discipline === 'all' || entry.dataset.disciplines.split(' ').includes(discipline);
    const matchesQuery = normalizeSearch(entry.textContent).includes(query);
    entry.hidden = !hasDiscipline || !matchesQuery;
    if (!entry.hidden) count += 1;
  }
  return count;
}

function filterVenues() {
  const discipline = disciplineButtons.find(button => button.getAttribute('aria-pressed') === 'true').dataset.discipline;
  const query = normalizeSearch(venueSearch.value);
  const clubCount = filterEntries(otherVenues, discipline, query);
  const directoryCount = filterEntries(directorySpots, discipline, query);
  const count = clubCount + directoryCount;
  directory.hidden = directoryCount === 0;
  if (directoryCount > 0 && (query || discipline !== 'all')) directory.open = true;
  emptyCatalog.hidden = count > 0;
  resultsStatus.textContent = count > 0
    ? `Площадок по выбранным фильтрам — ${count}.`
    : 'По этим фильтрам площадок пока нет.';
}

function resetFilters() {
  markSelected(disciplineButtons, disciplineButtons[0]);
  venueSearch.value = '';
  filterVenues();
}

const filters = document.querySelector('[data-filters]');
const filtersEnabled = filters.dataset.filters !== 'off';
if (filtersEnabled) {
  filters.hidden = false;
  for (const button of disciplineButtons) {
    button.addEventListener('click', () => {
      markSelected(disciplineButtons, button);
      filterVenues();
    });
  }
  venueSearch.addEventListener('input', filterVenues);
  document.querySelector('#reset-filters').addEventListener('click', () => {
    resetFilters();
    disciplineButtons[0].focus();
  });
  filterVenues();
}

function openLinkedSchoolVenue() {
  const venue = document.getElementById(window.location.hash.slice(1));
  if (venue?.matches('details.school-venue')) venue.open = true;
}

openLinkedSchoolVenue();
window.addEventListener('hashchange', openLinkedSchoolVenue);

function initCalendar() {
  const calendar = document.querySelector('#calendar');
  const monthPanel = calendar.querySelector('#calendar-month');
  const monthTitle = calendar.querySelector('#calendar-month-title');
  const days = calendar.querySelector('[data-calendar-days]');
  const seasons = [...calendar.querySelectorAll('[data-season]')];
  const steps = [...calendar.querySelectorAll('[data-month-step]')];
  const eventList = calendar.querySelector('#calendar-events');
  const empty = calendar.querySelector('[data-calendar-empty]');
  const status = calendar.querySelector('[data-calendar-status]');
  const plan = calendar.querySelector('[data-calendar-plan]');
  const events = [...eventList.querySelectorAll('.event')].map(item => {
    const start = item.querySelector('time').dateTime;
    return { item, start, end: item.dataset.eventEnd || start };
  });
  const years = seasons.map(button => Number(button.dataset.season));
  const firstMonth = Date.UTC(Math.min(...years), 0, 1);
  const lastMonth = Date.UTC(Math.max(...years), 11, 1);
  const monthFormat = new Intl.DateTimeFormat('ru-RU', { month: 'long', timeZone: 'UTC' });
  const dayFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'full', timeZone: 'UTC' });
  const dateKey = date => date.toISOString().slice(0, 10);
  let month;
  let monthEnd;
  let selectedDay = '';

  function showEvents() {
    const start = selectedDay || dateKey(month);
    const end = selectedDay || dateKey(monthEnd);
    let count = 0;
    for (const event of events) {
      event.item.hidden = event.start > end || event.end < start;
      if (!event.item.hidden) count += 1;
    }
    eventList.hidden = count === 0;
    empty.hidden = count !== 0;
    status.textContent = count ? `Показано событий — ${count}.` : empty.textContent;
  }

  function showMonth(year, index) {
    month = new Date(Date.UTC(year, index, 1));
    year = month.getUTCFullYear();
    index = month.getUTCMonth();
    monthEnd = new Date(Date.UTC(year, index + 1, 0));
    selectedDay = '';
    const name = monthFormat.format(month);
    monthTitle.textContent = `${name[0].toLocaleUpperCase('ru-RU')}${name.slice(1)} ${year}`;
    markSelected(seasons, seasons.find(button => Number(button.dataset.season) === year));
    for (const step of steps) {
      const target = Date.UTC(year, index + Number(step.dataset.monthStep), 1);
      step.disabled = target < firstMonth || target > lastMonth;
    }
    plan.hidden = Number(plan.dataset.calendarPlan) !== year;

    const offset = (month.getUTCDay() + 6) % 7;
    const dayCount = monthEnd.getUTCDate();
    const weeks = Math.ceil((offset + dayCount) / 7);
    days.replaceChildren();
    for (let week = 0; week < weeks; week += 1) {
      const row = days.insertRow();
      for (let weekday = 0; weekday < 7; weekday += 1) {
        const cell = row.insertCell();
        const number = week * 7 + weekday - offset + 1;
        if (number < 1 || number > dayCount) continue;

        const date = new Date(Date.UTC(year, index, number));
        const key = dateKey(date);
        const count = events.filter(event => event.start <= key && event.end >= key).length;
        const day = document.createElement(count ? 'button' : 'span');
        day.className = 'calendar-day';
        day.textContent = String(number);
        if (count) {
          day.type = 'button';
          day.dataset.calendarDate = key;
          day.setAttribute('aria-pressed', 'false');
          day.setAttribute('aria-label', `${dayFormat.format(date)}. Событий — ${count}.`);
        }
        cell.append(day);
      }
    }
    showEvents();
  }

  function showSeason(year) {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const latest = events.filter(event => event.start <= end && event.end >= start)
      .map(event => event.end < end ? event.end : end).sort().at(-1);
    showMonth(year, latest ? Number(latest.slice(5, 7)) - 1 : 0);
  }

  for (const button of seasons) {
    button.addEventListener('click', () => showSeason(Number(button.dataset.season)));
  }
  for (const button of steps) {
    button.addEventListener('click', () => {
      showMonth(month.getUTCFullYear(), month.getUTCMonth() + Number(button.dataset.monthStep));
    });
  }
  days.addEventListener('click', event => {
    const button = event.target.closest('[data-calendar-date]');
    if (!button) return;
    const date = button.dataset.calendarDate;
    selectedDay = selectedDay === date ? '' : date;
    markSelected(days.querySelectorAll('[data-calendar-date]'), selectedDay ? button : null);
    showEvents();
  });

  const latest = events.map(event => event.end).sort().at(-1);
  const latestYear = Number(latest?.slice(0, 4));
  showSeason(years.includes(latestYear) ? latestYear : years[0]);
  calendar.querySelector('[data-season-controls]').hidden = false;
  monthPanel.hidden = false;
}

initCalendar();

const dialog = document.querySelector('#booking');
if (typeof dialog.showModal === 'function') {
  const title = dialog.querySelector('#booking-title');
  const intro = dialog.querySelector('#booking-intro');
  const picker = dialog.querySelector('#booking-picker');
  const options = dialog.querySelector('#booking-venue');
  const detail = dialog.querySelector('#booking-detail');
  const primary = dialog.querySelector('#booking-primary');
  const source = dialog.querySelector('#booking-source');
  const phone = dialog.querySelector('#booking-phone');
  const goToCatalog = dialog.querySelector('#booking-catalog');
  let returnFocus;

  const schoolOptions = options.querySelector('[data-school-options]');
  const otherOptions = options.querySelector('[data-other-options]');

  const venueDetails = new Map([...document.querySelectorAll('[data-venue]')].map(venue => {
    const name = venue.querySelector('[data-venue-name]').textContent;
    const action = venue.querySelector('[data-venue-action]');
    if (venue.hasAttribute('data-trial-venue')) {
      const discipline = venue.querySelector('[data-venue-discipline]').textContent;
      const group = venue.hasAttribute('data-school-venue') ? schoolOptions : otherOptions;
      group.append(new Option(`${name} · ${discipline}`, venue.id));
    }
    return [venue.id, {
      name,
      address: venue.querySelector('[data-venue-address]').textContent,
      description: venue.querySelector('[data-venue-description]').textContent,
      schedule: venue.querySelector('[data-venue-schedule]').textContent,
      action,
      source: venue.querySelector('[data-venue-source]'),
      phone: venue.querySelector('[data-venue-phone]')
    }];
  }));

  function showVenue(venue) {
    detail.hidden = !venue;
    if (!venue) return;

    dialog.querySelector('#booking-club').textContent = venue.name;
    dialog.querySelector('#booking-address').textContent = venue.address;
    dialog.querySelector('#booking-description').textContent = venue.description;
    dialog.querySelector('#booking-schedule-text').textContent = venue.schedule;
    primary.href = venue.action.href;
    primary.textContent = venue.action.dataset.primaryLabel;
    source.href = venue.source.href;
    source.textContent = venue.source.textContent;
    phone.href = venue.phone.href;
    phone.textContent = venue.phone.textContent;
  }

  function openBooking(event, venue) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const trigger = event.currentTarget;
    returnFocus = trigger.classList.contains('mobile-book') ? menuToggle : trigger;
    title.textContent = venue ? 'Расписание и запись' : 'Пробное занятие';
    intro.hidden = Boolean(venue);
    picker.hidden = Boolean(venue);
    options.value = '';
    showVenue(venue);
    dialog.showModal();
    if (!venue) options.focus();
  }

  options.addEventListener('change', () => showVenue(venueDetails.get(options.value)));
  document.querySelectorAll('[data-trial]').forEach(trigger => {
    trigger.addEventListener('click', event => openBooking(event));
  });
  venueDetails.forEach(venue => {
    venue.action.addEventListener('click', event => openBooking(event, venue));
  });
  goToCatalog.addEventListener('click', () => {
    returnFocus = null;
    if (filtersEnabled) resetFilters();
    dialog.close();
    document.querySelector('#venues-title').focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => returnFocus?.focus({ preventScroll: true }));
}
