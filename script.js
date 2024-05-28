document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const clickEffectContainer = document.getElementById('clickEffectContainer');
    const settingsIcon = document.querySelector('.cog-icon');
    const settingsWindow = document.getElementById('settingsWindow');
    const telegramIcon = document.querySelector('.telegram-icon');
    const telegramWindow = document.getElementById('telegramWindow');
    const certificateIcon = document.querySelector('.certificate-icon');
    const certificateWindow = document.getElementById('certificateWindow');
    const animationToggle = document.getElementById('animationToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const subscribeButton = document.getElementById('subscribeButton');
    const bonusButton = document.getElementById('bonusButton');

    let username = '';
    let clickCount = 0;
    let enableAnimation = true;
    let enableVibration = true;
    let bonusClaimed = false;

    let settingsWindowOpen = false;
    let telegramWindowOpen = false;
    let certificateWindowOpen = false;

    settingsIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        settingsWindow.style.display = settingsWindowOpen ? 'none' : 'block';
        settingsWindowOpen = !settingsWindowOpen;
    });

    telegramIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        telegramWindow.style.display = telegramWindowOpen ? 'none' : 'block';
        telegramWindowOpen = !telegramWindowOpen;
    });

    certificateIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        certificateWindow.style.display = certificateWindowOpen ? 'none' : 'block';
        certificateWindowOpen = !certificateWindowOpen;
    });

    document.addEventListener('click', function() {
        if (settingsWindowOpen) {
            settingsWindow.style.display = 'none';
            settingsWindowOpen = false;
        }
        if (telegramWindowOpen) {
            telegramWindow.style.display = 'none';
            telegramWindowOpen = false;
        }
        if (certificateWindowOpen) {
            certificateWindow.style.display = 'none';
            certificateWindowOpen = false;
        }
    });

    animationToggle.addEventListener('change', function() {
        enableAnimation = animationToggle.checked;
    });

    vibrationToggle.addEventListener('change', function() {
        enableVibration = vibrationToggle.checked;
    });

    function initialize() {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            username = storedUsername;
            usernameDisplay.textContent = username;
            db.collection("clicks").doc(username).get().then(doc => {
                if (doc.exists) {
                    clickCount = doc.data().clickCount;
                    bonusClaimed = doc.data().bonusClaimed;
                    countDisplay.textContent = clickCount;
                }
            }).catch(error => {
                console.error("Помилка отримання документа:", error);
            });
        } else {
            // Код для обробки введення імені
        }
        updateLeaderboard();
    }

    function vibrate() {
        if (enableVibration && navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    function createClickEffect(x, y) {
        if (enableAnimation) {
            const clickEffect = document.createElement('div');
            clickEffect.className = 'click-effect';
            clickEffect.style.left = `${x}px`;
            clickEffect.style.top = `${y}px`;
            clickEffectContainer.appendChild(clickEffect);

            setTimeout(() => {
                clickEffect.remove();
            }, 1000);
        }
    }

    button.addEventListener('click', function(event) {
        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount;
            db.collection("clicks").doc(username).set({ clickCount, bonusClaimed })
                .then(() => {
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

    button.addEventListener('touchstart', function(event) {
        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount;
            db.collection("clicks").doc(username).set({ clickCount, bonusClaimed })
                .then(() => {
                    updateLeaderboard();
                })
                .catch(error => {
                    console.error("Помилка оновлення документа:", error);
                });

            vibrate();

            const rect = button.getBoundingClientRect();
            for (let i = 0; i < event.touches.length; i++) {
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
        if (!bonusClaimed) {
            db.collection("clicks").doc(username).get().then(doc => {
                if (doc.exists) {
                    clickCount += 10000;  // Add 10000 clicks as a bonus
                    bonusClaimed = true;
                    countDisplay.textContent = clickCount;
                    bonusButton.disabled = true;
                    db.collection("clicks").doc(username).set({ clickCount, bonusClaimed })
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
    }

    subscribeButton.addEventListener('click', subscribeToChannel);
    bonusButton.addEventListener('click', claimBonus);

    initialize();
});
