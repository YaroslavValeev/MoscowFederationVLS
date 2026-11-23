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
  venueGrid.hidden = clubCount === 0;
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

document.querySelector('[data-filters]').hidden = false;
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

function openLinkedSchoolVenue() {
  const venue = document.getElementById(window.location.hash.slice(1));
  if (venue?.matches('details.school-venue')) venue.open = true;
}

openLinkedSchoolVenue();
window.addEventListener('hashchange', openLinkedSchoolVenue);

const seasonButtons = [...document.querySelectorAll('[data-season]')];
const eventPanels = [...document.querySelectorAll('[data-events]')];
function showSeason(button) {
  markSelected(seasonButtons, button);
  eventPanels.forEach(panel => {
    panel.hidden = panel.dataset.events !== button.dataset.season;
  });
}
document.querySelector('[data-season-controls]').hidden = false;
seasonButtons.forEach(button => button.addEventListener('click', () => showSeason(button)));
showSeason(seasonButtons[0]);

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
    resetFilters();
    dialog.close();
    document.querySelector('#venues-title').focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => returnFocus?.focus({ preventScroll: true }));
}
