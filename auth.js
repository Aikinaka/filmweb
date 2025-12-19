document.addEventListener('DOMContentLoaded', () => {
    //Регистрация
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const login = document.getElementById('reg-login').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-password-confirm').value;
            
            //Валидация
            if (!login || login.length < 3) {
                showNotification('Логин должен содержать минимум 3 символа', 'error');
                return;
            }
            
            if (!email || !email.includes('@')) {
                showNotification('Введите корректный email', 'error');
                return;
            }
            
            if (!password || password.length < 6) {
                showNotification('Пароль должен содержать минимум 6 символов', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            
            const userData = {
                login,
                email,
                password
            };
            
            //Сохраниение данных пользователя
            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

            if (existingUsers.some(user => user.login === login || user.email === email)) {
                showNotification('Пользователь с таким логином или email уже существует', 'error');
                return;
            }

            // Добавляем нового пользователя
            existingUsers.push(userData);

            // Сохраняем массив пользователей
            localStorage.setItem('users', JSON.stringify(existingUsers));

            // Также сохраняем текущего пользователя для авторизации
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            //Переход на страницу входа
            showNotification('Регистрация успешна! Переходим на страницу входа', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
    
    //Вход
    const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const login = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Получаем всех пользователей
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const storedCurrentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Проверяем сначала текущего пользователя
        if (storedCurrentUser.login === login && storedCurrentUser.password === password) {
            localStorage.setItem('isLoggedIn', 'true');
            showNotification('Вход выполнен успешно!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return;
        }
        
        // Ищем среди всех пользователей
        const foundUser = storedUsers.find(user => 
            user.login === login && user.password === password
        );
        
        if (foundUser) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            showNotification('Вход выполнен успешно!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification('Неверный логин или пароль', 'error');
        }
    });
}
});

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