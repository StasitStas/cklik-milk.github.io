document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');

    let username = '';
    let clickCount = 0;

    function getUsernameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username');
    }

    function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            clickCount = localStorage.getItem(username) || 0;
            countDisplay.textContent = clickCount;
            updateLeaderboard();
        } else {
            alert('Помилка: Не вказано ім\'я користувача.');
        }
    }

    button.addEventListener('click', function() {
        if (username) {
            clickCount++;
            localStorage.setItem(username, clickCount);
            countDisplay.textContent = clickCount;
            updateLeaderboard();
        } else {
            alert('Помилка: Не вказано ім\'я користувача.');
        }
    });

    function updateLeaderboard() {
        const users = Object.keys(localStorage).map(key => ({
            name: key,
            count: parseInt(localStorage.getItem(key))
        }));

        users.sort((a, b) => b.count - a.count);

        leaderboardList.innerHTML = '';
        users.slice(0, 5).forEach((user, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${user.name}: ${user.count} кліків`;
            leaderboardList.appendChild(listItem);
        });

        const currentUserIndex = users.findIndex(user => user.name === username);
        if (currentUserIndex >= 5) {
            const listItem = document.createElement('li');
            listItem.textContent = `${currentUserIndex + 1}. ${username}: ${clickCount} кліків`;
            leaderboardList.appendChild(listItem);
        }
    }

    button.addEventListener('mousedown', function(event) {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const offsetX = (x - centerX) / centerX * 5;
        const offsetY = (y - centerY) / centerY * 5;

        button.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.99)`;
    });

    button.addEventListener('mouseup', function() {
        button.style.transform = 'translate(0, 0) scale(1)';
    });

    button.addEventListener('mouseleave', function() {
        button.style.transform = 'translate(0, 0) scale(1)';
    });

    initialize();
});
