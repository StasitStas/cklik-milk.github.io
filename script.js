document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const clickEffectContainer = document.getElementById('clickEffectContainer');
    const settingsIcon = document.querySelector('.cog-icon');
    const settingsWindow = document.getElementById('settingsWindow');
    const animationToggle = document.getElementById('animationToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const subscribeButton = document.getElementById('subscribeButton');
    const bonusButton = document.getElementById('bonusButton');

    let username = '';
    let clickCount = 0;
    let enableAnimation = true;
    let enableVibration = true;

    settingsIcon.addEventListener('click', function() {
        settingsWindow.style.display = settingsWindow.style.display === 'none' ? 'block' : 'none';
    });

    animationToggle.addEventListener('change', function() {
        enableAnimation = animationToggle.checked;
    });

    vibrationToggle.addEventListener('change', function() {
        enableVibration = vibrationToggle.checked;
    });

    function getUsernameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username');
    }

    function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            usernameDisplay.textContent = username;
            db.collection("clicks").doc(username).get().then(doc => {
                if (doc.exists) {
                    clickCount = doc.data().clickCount || 0;
                    countDisplay.textContent = clickCount;
                } else {
                    db.collection("clicks").doc(username).set({ clickCount: 0 });
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
        if (enableVibration) {
            try {
                window.navigator.vibrate(50);
            } catch (error) {
                console.error("Помилка вібрації:", error);
            }
        }
    }

    function createClickEffect(x, y) {
        if (enableAnimation) {
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
    }

    button.addEventListener('touchstart', function(event) {
        event.preventDefault();
        if (username) {
            const touchPoints = Math.min(event.touches.length, 4);
            clickCount += touchPoints;
            countDisplay.textContent = clickCount;
            db.collection("clicks").doc(username).set({ clickCount })
                .then(() => {
                    updateLeaderboard();
                })
                .catch(error => {
                    console.error("Помилка оновлення документа:", error);
                });
            vibrate();

            const rect = button.getBoundingClientRect();
            for (let i = 0; i < touchPoints; i++) {
                const touch = event.touches[i];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                createClickEffect(x, y);
            }
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

    // Function to open Telegram bot subscription
    function subscribeToChannel() {
        const telegramLink = "https://t.me/mqilky";  // Replace with your Telegram channel link
        window.open(telegramLink, "_blank");
    }

    // Function to update click count with bonus
    function claimBonus() {
        db.collection("clicks").doc(username).get().then(doc => {
            if (doc.exists) {
                clickCount += 100;  // Add 100 clicks as a bonus
                countDisplay.textContent = clickCount;
                db.collection("clicks").doc(username).set({ clickCount })
                    .then(() => {
                        updateLeaderboard();
                    })
                    .catch(error => {
                        console.error("Помилка оновлення документа:", error);
                    });
            }
        }).catch(error => {
            console.error("Error getting document:", error);
        });
    }

    subscribeButton.addEventListener('click', subscribeToChannel);
    bonusButton.addEventListener('click', claimBonus);

    initialize();
});
