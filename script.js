document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const userAvatar = document.getElementById('userAvatar');
    const clickEffectContainer = document.getElementById('clickEffectContainer');

    let username = '';
    let clickCount = 0;

    function getUsernameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username');
    }

    function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            usernameDisplay.textContent = username; // Відображення імені користувача у верхньому лівому кутку

            // Отримання аватарки користувача
            fetch(`https://api.telegram.org/bot${TOKEN}/getUserProfilePhotos?user_id=${username}`)
                .then(response => response.json())
                .then(data => {
                    if (data.ok && data.result.photos.length > 0) {
                        const avatarUrl = `https://api.telegram.org/file/bot${TOKEN}/${data.result.photos[0][0].file_id}`;
                        userAvatar.src = avatarUrl;
                    } else {
                        userAvatar.src = 'default-avatar.png'; // Шлях до стандартної аватарки
                    }
                });

            console.log(`Username: ${username}`);
            db.collection("clicks").doc(username).get().then(doc => {
                if (doc.exists) {
                    clickCount = doc.data().clickCount || 0;
                    countDisplay.textContent = clickCount;
                    console.log(`Initial Click Count: ${clickCount}`);
                } else {
                    db.collection("clicks").doc(username).set({ clickCount: 0 });
                    console.log(`Document created for ${username}`);
                }
                updateLeaderboard();
            }).catch(error => {
                console.error("Error getting document:", error);
            });
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    function vibrate() {
        try {
            window.navigator.vibrate(50);
            console.log("Вібрація працює");
        } catch (error) {
            console.error("Помилка вібрації:", error);
        }
    }

    function createClickEffect(x, y) {
        const clickEffect = document.createElement('span');
        clickEffect.textContent = '+1';
        clickEffect.className = 'click-effect';
        clickEffect.style.left = `${x}px`;
        clickEffect.style.top = `${y}px`;
        clickEffectContainer.appendChild(clickEffect);

        setTimeout(() => {
            clickEffect.remove();
        }, 1000);
    }

    button.addEventListener('click', function(event) {
        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount;
            db.collection("clicks").doc(username).set({ clickCount })
                .then(() => {
                    console.log(`Оновлено кількість кліків для ${username}: ${clickCount}`);
                    updateLeaderboard();
                })
                .catch(error => {
                    console.error("Помилка оновлення документа:", error);
                });
            vibrate();

            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            createClickEffect(x, y);
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    });

    function updateLeaderboard() {
        db.collection("clicks").orderBy("clickCount", "desc").limit(5).get().then(querySnapshot => {
            leaderboardList.innerHTML = '';
            let index = 0;
            querySnapshot.forEach(doc => {
                index++;
                const listItem = document.createElement('li');
                listItem.textContent = `${index}. ${doc.id}: ${doc.data().clickCount}`;
                leaderboardList.appendChild(listItem);
            });
        }).catch(error => {
            console.error("Помилка отримання документів: ", error);
        });
    }

    initialize();
});
