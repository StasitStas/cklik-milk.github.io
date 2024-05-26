document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');
    const usernameDisplay = document.getElementById('usernameDisplay');

    let username = '';
    let clickCount = 0;

    function getUsernameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username');
    }

    function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            usernameDisplay.textContent = username;
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
            navigator.vibrate(200);
        }
    }

    function updateLeaderboard() {
        db.collection("clicks").orderBy("clickCount", "desc").limit(5).get().then(querySnapshot => {
            leaderboardList.innerHTML = '';
            let userFoundInTop5 = false;
            let rank = 0;

            querySnapshot.forEach((doc, index) => {
                rank++;
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${doc.id} - ${doc.data().clickCount}`;
                leaderboardList.appendChild(li);

                if (doc.id === username) {
                    userFoundInTop5 = true;
                }
            });

            if (!userFoundInTop5) {
                db.collection("clicks").orderBy("clickCount", "desc").get().then(allDocs => {
                    let userRank = 0;
                    allDocs.forEach((doc, index) => {
                        if (doc.id === username) {
                            userRank = index + 1;
                        }
                    });

                    const userRankItem = document.createElement('li');
                    userRankItem.textContent = `${userRank}. ${username} - ${clickCount}`;
                    leaderboardList.appendChild(userRankItem);
                });
            }
        });
    }

    button.addEventListener('click', () => {
        clickCount++;
        countDisplay.textContent = clickCount;
        vibrate();

        db.collection("clicks").doc(username).update({ clickCount: clickCount }).then(() => {
            console.log(`Click Count updated: ${clickCount}`);
            updateLeaderboard();
        }).catch(error => {
            console.error("Error updating click count:", error);
        });
    });

    initialize();
});
