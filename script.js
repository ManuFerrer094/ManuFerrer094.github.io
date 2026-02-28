// ============================
// CONFIGURACIÓN
// ============================
var PROXY_BASE = 'https://api.allorigins.win/raw?url=';
var ITEMS_PER_PAGE = 20;

var API_CONFIG = {
    jobicy: {
        name: 'Jobicy',
        baseUrl: 'https://jobicy.com/api/v2/remote-jobs',
        supportsServerPagination: false,
        buildUrl: function (params) {
            var url = this.baseUrl + '?count=50';
            if (params.geo) url += '&geo=' + encodeURIComponent(params.geo);
            return url;
        },
        normalize: function (response) {
            var jobs = (response && response.jobs) || [];
            return jobs.map(function (job) {
                var salaryParts = [];
                if (job.annualSalaryMin) salaryParts.push(job.annualSalaryMin);
                if (job.annualSalaryMax) salaryParts.push(job.annualSalaryMax);
                var salary = salaryParts.length > 0
                    ? salaryParts.join(' – ') + (job.salaryCurrency ? ' ' + job.salaryCurrency : '')
                    : null;
                var isRemote = (job.jobType && job.jobType.toLowerCase().indexOf('remote') !== -1) ||
                    (job.jobGeo && job.jobGeo.toLowerCase().indexOf('remote') !== -1) ||
                    (job.jobGeo && job.jobGeo.toLowerCase() === 'anywhere');
                return {
                    title: job.jobTitle || 'Sin título',
                    company: job.companyName || 'Empresa desconocida',
                    location: job.jobGeo || 'No especificada',
                    remote: isRemote,
                    salary: salary,
                    salaryMin: parseFloat(job.annualSalaryMin) || null,
                    salaryMax: parseFloat(job.annualSalaryMax) || null,
                    tags: [job.jobIndustry].filter(Boolean),
                    url: job.url || '#',
                    date: job.pubDate ? new Date(job.pubDate) : new Date(),
                    description: job.jobExcerpt || ''
                };
            });
        }
    },
    arbeitnow: {
        name: 'Arbeitnow',
        baseUrl: 'https://www.arbeitnow.com/api/job-board-api',
        supportsServerPagination: true,
        buildUrl: function (params) {
            var page = params.serverPage || 1;
            return this.baseUrl + '?page=' + page;
        },
        normalize: function (response) {
            var jobs = (response && response.data) || [];
            return jobs.map(function (job) {
                return {
                    title: job.title || 'Sin título',
                    company: job.company_name || 'Empresa desconocida',
                    location: job.location || 'No especificada',
                    remote: !!job.remote,
                    salary: null,
                    salaryMin: null,
                    salaryMax: null,
                    tags: Array.isArray(job.tags) ? job.tags : [],
                    url: job.url || '#',
                    date: job.created_at ? new Date(job.created_at * 1000) : new Date(),
                    description: stripHtml(job.description || '')
                };
            });
        }
    },
    remoteok: {
        name: 'RemoteOK',
        baseUrl: 'https://remoteok.com/api',
        supportsServerPagination: false,
        buildUrl: function () {
            return this.baseUrl;
        },
        normalize: function (response) {
            if (!Array.isArray(response)) return [];
            // First element is metadata -- skip it
            var jobs = response.slice(1);
            return jobs.map(function (job) {
                var salary = null;
                var salaryMin = null;
                var salaryMax = null;
                if (job.salary_min && job.salary_max) {
                    salary = formatSalaryRange(job.salary_min, job.salary_max, 'USD');
                    salaryMin = parseFloat(job.salary_min);
                    salaryMax = parseFloat(job.salary_max);
                }
                return {
                    title: job.position || 'Sin título',
                    company: job.company || 'Empresa desconocida',
                    location: job.location || 'Remote',
                    remote: true,
                    salary: salary,
                    salaryMin: salaryMin,
                    salaryMax: salaryMax,
                    tags: Array.isArray(job.tags) ? job.tags : [],
                    url: job.url || '#',
                    date: job.date ? new Date(job.date) : new Date(),
                    description: stripHtml(job.description || '')
                };
            });
        }
    }
};

// ============================
// ESTADO GLOBAL
// ============================
var state = {
    currentApi: safeGetItem('jobvista-api') || 'jobicy',
    allJobs: [],
    filteredJobs: [],
    page: 1,
    serverPage: 1,
    view: safeGetItem('jobvista-view') || 'grid',
    theme: safeGetItem('jobvista-theme') || 'system',
    sortBy: null,
    isLoading: false,
    error: null,
    usingProxy: false,
    totalServerJobs: 0
};

// ============================
// UTILIDADES
// ============================
function safeGetItem(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSetItem(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

function stripHtml(html) {
    if (!html) return '';
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
}

function formatSalaryRange(min, max, currency) {
    function fmt(n) {
        n = parseFloat(n);
        if (isNaN(n)) return '?';
        if (n >= 1000) return '$' + Math.round(n / 1000) + 'k';
        return '$' + n;
    }
    var cur = currency || 'USD';
    if (min && max) return fmt(min) + ' – ' + fmt(max) + ' ' + cur;
    if (min) return fmt(min) + '+ ' + cur;
    if (max) return 'Hasta ' + fmt(max) + ' ' + cur;
    return null;
}

function timeAgo(date) {
    if (!date || isNaN(date.getTime())) return 'Fecha desconocida';
    var now = new Date();
    var diffMs = now - date;
    var diffSecs = Math.floor(diffMs / 1000);
    var diffMins = Math.floor(diffSecs / 60);
    var diffHours = Math.floor(diffMins / 60);
    var diffDays = Math.floor(diffHours / 24);
    var diffWeeks = Math.floor(diffDays / 7);
    var diffMonths = Math.floor(diffDays / 30);

    if (diffSecs < 60) return 'hace un momento';
    if (diffMins < 60) return 'hace ' + diffMins + (diffMins === 1 ? ' minuto' : ' minutos');
    if (diffHours < 24) return 'hace ' + diffHours + (diffHours === 1 ? ' hora' : ' horas');
    if (diffDays < 7) return 'hace ' + diffDays + (diffDays === 1 ? ' día' : ' días');
    if (diffWeeks < 5) return 'hace ' + diffWeeks + (diffWeeks === 1 ? ' semana' : ' semanas');
    return 'hace ' + diffMonths + (diffMonths === 1 ? ' mes' : ' meses');
}

function debounce(fn, ms) {
    var timer;
    return function () {
        var args = arguments;
        var ctx = this;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ============================
// FETCH
// ============================
function fetchJobs() {
    var apiKey = state.currentApi;
    var config = API_CONFIG[apiKey];
    if (!config) return;

    state.isLoading = true;
    state.error = null;
    state.usingProxy = false;
    renderJobs();

    var params = { serverPage: state.serverPage };
    var url = config.buildUrl(params);

    fetch(url)
        .then(function (res) {
            if (!res.ok) throw new TypeError('HTTP error ' + res.status);
            return res.json();
        })
        .then(function (data) {
            handleFetchSuccess(config, data);
        })
        .catch(function () {
            // Retry with CORS proxy
            var proxyUrl = PROXY_BASE + encodeURIComponent(url);
            state.usingProxy = true;
            fetch(proxyUrl)
                .then(function (res) {
                    if (!res.ok) throw new TypeError('Proxy HTTP error ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    handleFetchSuccess(config, data);
                })
                .catch(function (err) {
                    state.isLoading = false;
                    state.error = 'No se pudo conectar con la API de ' + config.name + '. Puede ser un problema de CORS o la API está caída.';
                    state.allJobs = [];
                    state.filteredJobs = [];
                    renderJobs();
                    renderPagination();
                    updateProxyNotice();
                });
        });
}

function handleFetchSuccess(config, data) {
    state.isLoading = false;
    state.allJobs = config.normalize(data);
    state.page = 1;
    populateFilterCheckboxes();
    applyFilters();
    renderJobs();
    renderPagination();
    updateProxyNotice();
}

function updateProxyNotice() {
    var notice = document.getElementById('proxyNotice');
    if (notice) {
        notice.classList.toggle('hidden', !state.usingProxy);
    }
}

// ============================
// FILTROS Y BÚSQUEDA
// ============================
function populateFilterCheckboxes() {
    var locations = {};
    var tags = {};

    state.allJobs.forEach(function (job) {
        var loc = (job.location || '').trim();
        if (loc && loc !== 'No especificada') {
            locations[loc] = true;
        }
        if (Array.isArray(job.tags)) {
            job.tags.forEach(function (tag) {
                var t = (tag || '').trim();
                if (t) tags[t] = true;
            });
        }
    });

    var locationKeys = Object.keys(locations).sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    var tagKeys = Object.keys(tags).sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    var locationContainer = document.getElementById('filterLocationList');
    if (locationContainer) {
        if (locationKeys.length === 0) {
            locationContainer.innerHTML = '<span class="text-xs text-gray-400 dark:text-gray-500">Sin datos</span>';
        } else {
            var html = '';
            locationKeys.forEach(function (loc) {
                var id = 'loc-' + loc.replace(/[^a-zA-Z0-9]/g, '_');
                html += '<label><input type="checkbox" class="filter-location-cb accent-indigo-600" value="' + escapeHtml(loc) + '"> ' + escapeHtml(loc) + '</label>';
            });
            locationContainer.innerHTML = html;
        }
    }

    var tagsContainer = document.getElementById('filterTagsList');
    if (tagsContainer) {
        if (tagKeys.length === 0) {
            tagsContainer.innerHTML = '<span class="text-xs text-gray-400 dark:text-gray-500">Sin datos</span>';
        } else {
            var html = '';
            tagKeys.forEach(function (tag) {
                html += '<label><input type="checkbox" class="filter-tag-cb accent-indigo-600" value="' + escapeHtml(tag) + '"> ' + escapeHtml(tag) + '</label>';
            });
            tagsContainer.innerHTML = html;
        }
    }

    // Attach change listeners to the new checkboxes
    setupCheckboxListeners();
}

function getCheckedValues(className) {
    var checked = [];
    var checkboxes = document.querySelectorAll('.' + className + ':checked');
    for (var i = 0; i < checkboxes.length; i++) {
        checked.push(checkboxes[i].value.toLowerCase());
    }
    return checked;
}

function setupCheckboxListeners() {
    var allCbs = document.querySelectorAll('.filter-location-cb, .filter-tag-cb');
    for (var i = 0; i < allCbs.length; i++) {
        allCbs[i].addEventListener('change', function () {
            state.page = 1;
            applyFilters();
            renderJobs();
            renderPagination();
        });
    }
}

function applyFilters() {
    var search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    var selectedLocations = getCheckedValues('filter-location-cb');
    var remote = document.getElementById('filterRemote').value;
    var selectedTags = getCheckedValues('filter-tag-cb');
    var salaryMin = parseFloat(document.getElementById('filterSalary').value) || 0;

    var jobs = state.allJobs.filter(function (job) {
        // Search
        if (search) {
            var inTitle = (job.title || '').toLowerCase().indexOf(search) !== -1;
            var inCompany = (job.company || '').toLowerCase().indexOf(search) !== -1;
            var inTags = job.tags.some(function (t) { return t.toLowerCase().indexOf(search) !== -1; });
            var inLocation = (job.location || '').toLowerCase().indexOf(search) !== -1;
            if (!inTitle && !inCompany && !inTags && !inLocation) return false;
        }
        // Location (checkboxes)
        if (selectedLocations.length > 0) {
            var jobLoc = (job.location || '').toLowerCase();
            var matchesLocation = selectedLocations.some(function (loc) {
                return jobLoc.indexOf(loc) !== -1;
            });
            if (!matchesLocation) return false;
        }
        // Remote
        if (remote === 'remote' && !job.remote) return false;
        if (remote === 'onsite' && job.remote) return false;
        // Tags (checkboxes)
        if (selectedTags.length > 0) {
            var hasTag = job.tags.some(function (t) {
                var tLower = t.toLowerCase();
                return selectedTags.some(function (st) {
                    return tLower.indexOf(st) !== -1;
                });
            });
            if (!hasTag) return false;
        }
        // Salary minimum
        if (salaryMin > 0) {
            if (job.salaryMin !== null && job.salaryMin < salaryMin) return false;
            // If no salary info, still show it
        }
        return true;
    });

    // Sort
    if (state.sortBy) {
        var field = state.sortBy.field;
        var dir = state.sortBy.direction === 'asc' ? 1 : -1;
        jobs.sort(function (a, b) {
            if (field === 'title') {
                return dir * (a.title || '').localeCompare(b.title || '');
            } else if (field === 'date') {
                return dir * ((a.date || 0) - (b.date || 0));
            } else if (field === 'salary') {
                var sa = a.salaryMin || 0;
                var sb = b.salaryMin || 0;
                return dir * (sa - sb);
            }
            return 0;
        });
    }

    state.filteredJobs = jobs;
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    // Uncheck all location checkboxes
    var locCbs = document.querySelectorAll('.filter-location-cb');
    for (var i = 0; i < locCbs.length; i++) locCbs[i].checked = false;
    document.getElementById('filterRemote').value = 'all';
    // Uncheck all tag checkboxes
    var tagCbs = document.querySelectorAll('.filter-tag-cb');
    for (var i = 0; i < tagCbs.length; i++) tagCbs[i].checked = false;
    document.getElementById('filterSalary').value = '';
    state.sortBy = null;
    state.page = 1;
    applyFilters();
    renderJobs();
    renderPagination();
}

// ============================
// RENDERIZADO
// ============================
function renderJobs() {
    var container = document.getElementById('jobsContainer');
    if (!container) return;

    if (state.isLoading) {
        container.innerHTML = renderSkeletons();
        return;
    }
    if (state.error) {
        container.innerHTML = renderError(state.error);
        return;
    }
    if (state.allJobs.length === 0) {
        container.innerHTML = renderApiEmpty();
        return;
    }

    var jobs = state.filteredJobs;
    var config = API_CONFIG[state.currentApi];
    var totalPages;
    var pageJobs;

    if (config && config.supportsServerPagination) {
        // Server-paginated: show all filtered jobs on current server page
        pageJobs = jobs;
        totalPages = 1; // Pagination handled by server
    } else {
        // Client-side pagination
        totalPages = Math.max(1, Math.ceil(jobs.length / ITEMS_PER_PAGE));
        if (state.page > totalPages) state.page = totalPages;
        var start = (state.page - 1) * ITEMS_PER_PAGE;
        pageJobs = jobs.slice(start, start + ITEMS_PER_PAGE);
    }

    if (jobs.length === 0) {
        container.innerHTML = renderEmpty();
        return;
    }

    updateResultsCount(jobs.length);

    if (state.view === 'table') {
        container.innerHTML = renderTable(pageJobs);
    } else {
        container.innerHTML = renderGrid(pageJobs);
    }

    updateViewButtons();
}

function updateResultsCount(count) {
    var el = document.getElementById('resultsCount');
    if (el) el.textContent = 'Resultados: ' + count;
}

function renderGrid(jobs) {
    var html = '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">';
    jobs.forEach(function (job) {
        var tagsHtml = '';
        var visibleTags = job.tags.slice(0, 4);
        var extraCount = job.tags.length - 4;
        visibleTags.forEach(function (tag) {
            tagsHtml += '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">' + escapeHtml(tag) + '</span>';
        });
        if (extraCount > 0) {
            tagsHtml += '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">+' + extraCount + ' más</span>';
        }

        var salaryHtml = job.salary
            ? '<p class="text-sm font-semibold text-green-600 dark:text-green-400">💰 ' + escapeHtml(job.salary) + '</p>'
            : '<p class="text-sm text-gray-400 dark:text-gray-500">💰 No especificado</p>';

        var remoteBadge = job.remote
            ? '<span class="text-xs font-medium text-green-700 dark:text-green-400">🟢 Remote</span>'
            : '<span class="text-xs font-medium text-red-600 dark:text-red-400">🔴 On-site</span>';

        var descHtml = job.description
            ? '<p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">' + escapeHtml(job.description.substring(0, 200)) + '</p>'
            : '';

        html += '<div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-200">';
        html += '  <h3 class="font-semibold text-base line-clamp-2">' + escapeHtml(job.title) + '</h3>';
        html += '  <p class="text-sm text-gray-600 dark:text-gray-300">🏢 ' + escapeHtml(job.company) + '</p>';
        html += '  <div class="flex items-center gap-2 flex-wrap">';
        html += '    <span class="text-sm text-gray-500 dark:text-gray-400">📍 ' + escapeHtml(job.location) + '</span>';
        html += '    ' + remoteBadge;
        html += '  </div>';
        html += '  ' + salaryHtml;
        if (tagsHtml) {
            html += '  <div class="flex flex-wrap gap-1">' + tagsHtml + '</div>';
        }
        html += descHtml;
        html += '  <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">';
        html += '    <span class="text-xs text-gray-400">' + timeAgo(job.date) + '</span>';
        html += '    <a href="' + escapeHtml(job.url) + '" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">Ver oferta →</a>';
        html += '  </div>';
        html += '</div>';
    });
    html += '</div>';
    return html;
}

function renderTable(jobs) {
    var sortIcon = function (field) {
        if (!state.sortBy || state.sortBy.field !== field) return ' ⇅';
        return state.sortBy.direction === 'asc' ? ' ▲' : ' ▼';
    };

    var html = '<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">';
    html += '<table class="w-full text-sm text-left">';
    html += '<thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">';
    html += '<tr>';
    html += '<th class="sortable px-4 py-3" data-sort="title">Título' + sortIcon('title') + '</th>';
    html += '<th class="px-4 py-3">Empresa</th>';
    html += '<th class="px-4 py-3">Ubicación</th>';
    html += '<th class="px-4 py-3">Remoto</th>';
    html += '<th class="sortable px-4 py-3" data-sort="salary">Salario' + sortIcon('salary') + '</th>';
    html += '<th class="sortable px-4 py-3" data-sort="date">Fecha' + sortIcon('date') + '</th>';
    html += '<th class="px-4 py-3">Acción</th>';
    html += '</tr></thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700">';

    jobs.forEach(function (job) {
        html += '<tr class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">';
        html += '<td class="px-4 py-3 font-medium max-w-[200px]"><span class="line-clamp-2">' + escapeHtml(job.title) + '</span></td>';
        html += '<td class="px-4 py-3">' + escapeHtml(job.company) + '</td>';
        html += '<td class="px-4 py-3 text-gray-500 dark:text-gray-400">' + escapeHtml(job.location) + '</td>';
        html += '<td class="px-4 py-3">' + (job.remote ? '🟢' : '🔴') + '</td>';
        html += '<td class="px-4 py-3">' + (job.salary ? escapeHtml(job.salary) : '<span class="text-gray-400">—</span>') + '</td>';
        html += '<td class="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">' + timeAgo(job.date) + '</td>';
        html += '<td class="px-4 py-3"><a href="' + escapeHtml(job.url) + '" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Ver →</a></td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
}

function renderSkeletons() {
    var html = '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">';
    for (var i = 0; i < 6; i++) {
        html += '<div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 space-y-3 animate-pulse">';
        html += '  <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>';
        html += '  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>';
        html += '  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>';
        html += '  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>';
        html += '  <div class="flex gap-2"><div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div><div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></div>';
        html += '  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-2"></div>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function renderError(message) {
    return '<div class="flex flex-col items-center justify-center py-16 text-center">' +
        '<span class="text-5xl mb-4">⚠️</span>' +
        '<p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Error al cargar ofertas</p>' +
        '<p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">' + escapeHtml(message) + '</p>' +
        '<button onclick="retryFetch()" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200">Reintentar</button>' +
        '</div>';
}

function renderEmpty() {
    return '<div class="flex flex-col items-center justify-center py-16 text-center">' +
        '<span class="text-5xl mb-4">🔍</span>' +
        '<p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No se encontraron ofertas con esos filtros.</p>' +
        '<button onclick="clearFilters()" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200 mt-4">Limpiar filtros</button>' +
        '</div>';
}

function renderApiEmpty() {
    return '<div class="flex flex-col items-center justify-center py-16 text-center">' +
        '<span class="text-5xl mb-4">📭</span>' +
        '<p class="text-lg font-medium text-gray-700 dark:text-gray-300">No hay más ofertas disponibles en esta API.</p>' +
        '</div>';
}

// ============================
// PAGINACIÓN
// ============================
function renderPagination() {
    var container = document.getElementById('pagination');
    if (!container) return;

    var config = API_CONFIG[state.currentApi];
    var html = '';

    if (config && config.supportsServerPagination) {
        // Server-side pagination
        var prevDisabled = state.serverPage <= 1;
        var nextDisabled = state.allJobs.length < ITEMS_PER_PAGE;

        html += '<button onclick="prevPage()" ' + (prevDisabled ? 'disabled' : '') +
            ' class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">← Anterior</button>';
        html += '<span class="text-sm text-gray-500 dark:text-gray-400">Página ' + state.serverPage + '</span>';
        html += '<button onclick="nextPage()" ' + (nextDisabled ? 'disabled' : '') +
            ' class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">Siguiente →</button>';
    } else {
        // Client-side pagination
        var totalPages = Math.max(1, Math.ceil(state.filteredJobs.length / ITEMS_PER_PAGE));
        if (totalPages <= 1) { container.innerHTML = ''; return; }

        var prevDisabled = state.page <= 1;
        var nextDisabled = state.page >= totalPages;

        html += '<button onclick="prevPage()" ' + (prevDisabled ? 'disabled' : '') +
            ' class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">← Anterior</button>';
        html += '<span class="text-sm text-gray-500 dark:text-gray-400">Página ' + state.page + ' de ' + totalPages + '</span>';
        html += '<button onclick="nextPage()" ' + (nextDisabled ? 'disabled' : '') +
            ' class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">Siguiente →</button>';
    }

    container.innerHTML = html;
}

function prevPage() {
    var config = API_CONFIG[state.currentApi];
    if (config && config.supportsServerPagination) {
        if (state.serverPage > 1) {
            state.serverPage--;
            fetchJobs();
        }
    } else {
        if (state.page > 1) {
            state.page--;
            renderJobs();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

function nextPage() {
    var config = API_CONFIG[state.currentApi];
    if (config && config.supportsServerPagination) {
        state.serverPage++;
        fetchJobs();
    } else {
        var totalPages = Math.max(1, Math.ceil(state.filteredJobs.length / ITEMS_PER_PAGE));
        if (state.page < totalPages) {
            state.page++;
            renderJobs();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

function retryFetch() {
    fetchJobs();
}

// ============================
// DARK MODE
// ============================
function initTheme() {
    var theme = state.theme;
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // System
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    updateThemeIcon();
}

function toggleTheme() {
    document.documentElement.classList.add('transitioning');
    var isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        state.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        state.theme = 'dark';
    }
    safeSetItem('jobvista-theme', state.theme);
    updateThemeIcon();
    setTimeout(function () {
        document.documentElement.classList.remove('transitioning');
    }, 300);
}

function updateThemeIcon() {
    var icon = document.getElementById('themeIcon');
    if (!icon) return;
    var isDark = document.documentElement.classList.contains('dark');
    icon.textContent = isDark ? '☀️' : '🌙';
}

// ============================
// VISTA TOGGLE
// ============================
function setView(view) {
    state.view = view;
    safeSetItem('jobvista-view', view);
    renderJobs();
    renderPagination();
    updateViewButtons();
}

function updateViewButtons() {
    var gridBtn = document.getElementById('viewGrid');
    var tableBtn = document.getElementById('viewTable');
    if (gridBtn) {
        gridBtn.classList.toggle('bg-indigo-100', state.view === 'grid');
        gridBtn.classList.toggle('dark:bg-indigo-900', state.view === 'grid');
        gridBtn.classList.toggle('text-indigo-700', state.view === 'grid');
        gridBtn.classList.toggle('dark:text-indigo-300', state.view === 'grid');
    }
    if (tableBtn) {
        tableBtn.classList.toggle('bg-indigo-100', state.view === 'table');
        tableBtn.classList.toggle('dark:bg-indigo-900', state.view === 'table');
        tableBtn.classList.toggle('text-indigo-700', state.view === 'table');
        tableBtn.classList.toggle('dark:text-indigo-300', state.view === 'table');
    }
}

// ============================
// SIDEBAR MOBILE
// ============================
function openSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('open');
    }
    if (overlay) overlay.classList.remove('hidden');
}

function closeSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.classList.remove('open');
        // Wait for transition, then hide
        setTimeout(function () {
            if (!sidebar.classList.contains('open') && window.innerWidth < 640) {
                sidebar.classList.add('hidden');
            }
        }, 300);
    }
    if (overlay) overlay.classList.add('hidden');
}

// ============================
// SORT (tabla)
// ============================
function handleSort(field) {
    if (state.sortBy && state.sortBy.field === field) {
        state.sortBy.direction = state.sortBy.direction === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortBy = { field: field, direction: 'asc' };
    }
    applyFilters();
    renderJobs();
    renderPagination();
}

// ============================
// EVENT LISTENERS
// ============================
function setupEventListeners() {
    // API Selector
    var apiSelector = document.getElementById('apiSelector');
    if (apiSelector) {
        apiSelector.value = state.currentApi;
        apiSelector.addEventListener('change', function () {
            state.currentApi = this.value;
            safeSetItem('jobvista-api', state.currentApi);
            state.serverPage = 1;
            state.page = 1;
            state.sortBy = null;
            clearFilters();
            fetchJobs();
        });
    }

    // Search input
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function () {
            state.page = 1;
            applyFilters();
            renderJobs();
            renderPagination();
        }, 300));
    }

    // Filters (only remote and salary remain as traditional inputs)
    var filterInputs = ['filterRemote', 'filterSalary'];
    filterInputs.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', debounce(function () {
                state.page = 1;
                applyFilters();
                renderJobs();
                renderPagination();
            }, 300));
            el.addEventListener('change', function () {
                state.page = 1;
                applyFilters();
                renderJobs();
                renderPagination();
            });
        }
    });

    // Clear filters
    var clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            clearFilters();
        });
    }

    // View toggle
    var viewGridBtn = document.getElementById('viewGrid');
    var viewTableBtn = document.getElementById('viewTable');
    if (viewGridBtn) viewGridBtn.addEventListener('click', function () { setView('grid'); });
    if (viewTableBtn) viewTableBtn.addEventListener('click', function () { setView('table'); });

    // Theme toggle
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Mobile sidebar
    var filterToggle = document.getElementById('filterToggle');
    if (filterToggle) filterToggle.addEventListener('click', openSidebar);

    var overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Table sort — delegated
    document.addEventListener('click', function (e) {
        var th = e.target.closest('th.sortable');
        if (th && th.dataset.sort) {
            handleSort(th.dataset.sort);
        }
    });

    // System theme change
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
            if (state.theme === 'system') initTheme();
        });
    }

    // Window resize — show sidebar on desktop
    window.addEventListener('resize', function () {
        var sidebar = document.getElementById('sidebar');
        if (window.innerWidth >= 640 && sidebar) {
            sidebar.classList.remove('hidden');
            sidebar.classList.remove('open');
        }
    });
}

// ============================
// INICIALIZACIÓN
// ============================
function init() {
    initTheme();
    setupEventListeners();
    updateViewButtons();
    fetchJobs();
}

document.addEventListener('DOMContentLoaded', init);
