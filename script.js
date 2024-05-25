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
            db.collection("clicks").doc(username).get().then(doc => {
                if (doc.exists) {
                    clickCount = doc.data().clickCount || 0;
                    countDisplay.textContent = clickCount;
                } else {
                    // If the document does not exist, create it with initial clickCount value of 0
                    db.collection("clicks").doc(username).set({ clickCount: 0 });
                }
                updateLeaderboard();
            }).catch(error => {
                console.error("Error getting document:", error);
            });
        } else {
            alert('Помилка: Не вказано ім\'я користувача.');
        }
    }

    button.addEventListener('click', function() {
        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount;
            // Update clickCount value in Firestore
            db.collection("clicks").doc(username).set({ clickCount });
            updateLeaderboard();
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
