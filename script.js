document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const coinCountDisplay = document.getElementById('coinCount');

    let username = '';
    let clickCount = 0;
    let coinCount = 0;

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
                    coinCount = doc.data().coinCount || 0;
                    countDisplay.textContent = clickCount;
                    coinCountDisplay.textContent = coinCount.toLocaleString(); // Format coin count
                    console.log(`Initial Click Count: ${clickCount}`);
                    console.log(`Initial Coin Count: ${coinCount}`);
                } else {
                    db.collection("clicks").doc(username).set({ clickCount: 0, coinCount: 0 });
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
        }
    }

    button.addEventListener('click', function() {
        if (username) {
            clickCount++;
            coinCount += 10; // Add 10 coins per click
            countDisplay.textContent = clickCount;
            coinCountDisplay.textContent = coinCount.toLocaleString(); // Format coin count
            db.collection("clicks").doc(username).set({ clickCount, coinCount })
                .then(() => {
                    console.log(`Updated Click Count for ${username}: ${clickCount}`);
                    console.log(`Updated Coin Count for ${username}: ${coinCount}`);
                    updateLeaderboard();
                })
                .catch(error => {
                    console.error("Error updating document:", error);
                });
            vibrate();
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
