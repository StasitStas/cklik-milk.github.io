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
            navigator.vibrate(100); // Вібрація на 100 мс
        }
    }

    button.addEventListener('click', function() {
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
            vibrate(); // Додаємо виклик функції вібрації тут
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
                listItem.textContent = `${index}. ${doc.id}: ${doc.data().clickCount} кліків`;
                leaderboardList.appendChild(listItem);
            });
        }).catch(error => {
            console.error("Error getting documents: ", error);
        });
    }

    initialize();
});
