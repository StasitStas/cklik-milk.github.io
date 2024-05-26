document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');
    const usernameDisplay = document.getElementById('usernameDisplay');
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
            usernameDisplay.textContent = username; // Display username at the top left
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
            alert('Помилка: Не вказано ім\'я користувача.');
        }
    }

    function vibrate() {
        if (navigator.vibrate) {
            console.log("Вібрація спрацьовує");
            navigator.vibrate(100);
        } else if (window.navigator && window.navigator.vibrate) {
            console.log("Вібрація через альтернативний метод");
            window.navigator.vibrate(100);
        } else if (window && window.navigator && window.navigator.userAgent && /iPhone|iPad|iPod/.test(window.navigator.userAgent)) {
            // Use Haptic Feedback API for iOS devices
            if (window.navigator.vibrate) {
                window.navigator.vibrate(100);
            } else if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.indexOf('Safari') !== -1) {
                window.navigator.userAgentData.vibrate(100);
            } else {
                // Fallback to haptic feedback for iOS
                try {
                    window.navigator.vibrate(100);
                } catch (e) {
                    console.log("Haptic feedback not supported");
                }
            }
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
                    console.log(`Updated Click Count for ${username}: ${clickCount}`);
                    updateLeaderboard();
                })
                .catch(error => {
                    console.error("Error updating document:", error);
                });
            vibrate();

            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            createClickEffect(x, y);
        } else {
            alert('Помилка: Не вказано ім\'я користувача.');
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
            console.error("Error getting documents: ", error);
        });
    }

    initialize();
});
