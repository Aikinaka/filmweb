document.addEventListener('DOMContentLoaded', () => {
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch && window.location.pathname.includes('index.html')) {
        const movies = JSON.parse(lastSearch);
        renderMovies(movies);
    }
    
    updateHeaderAuthStatus();
    
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const moviesGrid = document.getElementById('movies-grid');
    
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const query = input.value.trim();
            
            if (!query || query.length < 2) {
                showNotification('Введите название фильма (минимум 2 символа)', 'info', 'Внимание');
                return;
            }
            
            moviesGrid.innerHTML = '<div class="loading">Загрузка...</div>';
            
            try {
                const response = await fetch(`https://www.omdbapi.com/?apikey=5dc79e3c&s=${encodeURIComponent(query)}`);
                const data = await response.json();
                
                if (data.Response === 'True') {
                    renderMovies(data.Search);
                    localStorage.setItem('lastSearch', JSON.stringify(data.Search));
                } else {
                    moviesGrid.innerHTML = '<p class="no-results">Фильмы не найдены. Попробуйте другой запрос.</p>';
                }
            } catch (error) {
                console.error('Ошибка:', error);
                moviesGrid.innerHTML = '<p class="error">Произошла ошибка. Попробуйте снова.</p>';
            }
        });
    }
    
    const movieDetailsDiv = document.getElementById('movie-details');
    
    if (movieDetailsDiv) {
        const movieID = localStorage.getItem('selectedMovieID');
        
        if (!movieID) {
            movieDetailsDiv.innerHTML = '<p class="error">Фильм не найден!</p>';
            return;
        }
        
        fetch(`https://www.omdbapi.com/?apikey=5dc79e3c&i=${movieID}`)
            .then((response) => response.json())
            .then((movie) => {
                if (movie.Response === 'True') {
                    movieDetailsDiv.innerHTML = `
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600/ecf0f1/7f8c8d?text=Нет+постера'}" alt="${movie.Title}">
                        <h2>${movie.Title}</h2>
                        <p><strong>Год выпуска:</strong> ${movie.Year}</p>
                        <p><strong>Жанр:</strong> ${movie.Genre}</p>
                        <p><strong>Сюжет:</strong> ${movie.Plot}</p>
                        ${movie.Director !== 'N/A' ? `<p><strong>Режиссер:</strong> ${movie.Director}</p>` : ''}
                        ${movie.Actors !== 'N/A' ? `<p><strong>Актеры:</strong> ${movie.Actors}</p>` : ''}
                        ${movie.imdbRating !== 'N/A' ? `<p><strong>Рейтинг IMDB:</strong> ${movie.imdbRating}</p>` : ''}
                    `;
                } else {
                    movieDetailsDiv.innerHTML = '<p class="error">Ошибка загрузки данных фильма.</p>';
                }
            })
            .catch((error) => {
                console.error('Ошибка:', error);
                movieDetailsDiv.innerHTML = '<p class="error">Произошла ошибка. Попробуйте снова.</p>';
            });
    }
});

function renderMovies(movies) {
    const moviesGrid = document.getElementById('movies-grid');
    if (!moviesGrid) return;
    
    moviesGrid.innerHTML = movies
        .map((movie) => `
            <div class="movie-card" onclick="openMovieDetails('${movie.imdbID}')">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/ecf0f1/7f8c8d?text=Нет+изображения'}" 
                     alt="${movie.Title}"
                     onerror="this.src='https://via.placeholder.com/300x450/ecf0f1/7f8c8d?text=Ошибка+загрузки'">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <p>${movie.Type === 'movie' ? 'Фильм' : movie.Type === 'series' ? 'Сериал' : movie.Type}</p>
            </div>
        `)
        .join('');
}

function openMovieDetails(imdbID) {
    localStorage.setItem('selectedMovieID', imdbID);
    window.location.href = 'movie-details.html';
}

function showNotification(message, type = 'info', title = '') {
    if (!title) {
        switch(type) {
            case 'success':
                title = 'Успех!';
                break;
            case 'error':
                title = 'Ошибка!';
                break;
            case 'info':
                title = 'Информация';
                break;
            default:
                title = 'Сообщение';
        }
    }
    
    const oldNotification = document.querySelector('.modal-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    const modalHTML = `
        <div class="modal-notification ${type} show">
            <div class="modal-notification-content">
                <div class="modal-close-x" onclick="closeNotification()">×</div>
                <div class="modal-icon"></div>
                <h2 class="modal-title">${title}</h2>
                <div class="modal-message">${message}</div>
                <button class="modal-close-btn" onclick="closeNotification()">ОК</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    if (type !== 'error') {
        setTimeout(() => {
            closeNotification();
        }, 5000);
    }
}

function closeNotification() {
    const notification = document.querySelector('.modal-notification');
    if (notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }
}

window.closeNotification = closeNotification;

function updateHeaderAuthStatus() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons || !authButtons.closest('header')) return;
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        authButtons.innerHTML = `
            <span class="user-greeting">Привет, ${userData.login}!</span>
            <button onclick="logout()" class="btn-secondary">Выйти</button>
        `;
    } else if (window.location.pathname.includes('index.html')) {
        authButtons.innerHTML = `
            <a href="register.html" class="btn-secondary">Регистрация</a>
            <a href="login.html" class="btn-primary">Вход</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const logoImages = document.querySelectorAll('.logo-img');
    logoImages.forEach(img => {
        img.onerror = function() {
            console.warn('Логотип не загрузился, используется заглушка');
            this.src = 'https://via.placeholder.com/60/transparent/ffffff?text=ЖК&bg=transparent';
            this.alt = 'Логотип ЖабКино (заглушка)';
            this.style.backgroundColor = 'transparent';
        };
    });
});