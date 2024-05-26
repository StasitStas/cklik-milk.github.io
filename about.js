document.addEventListener('DOMContentLoaded', function() {
    const username = getUrlParameter('username');
    const cogIcon = document.querySelector('.cog-icon');
    if (cogIcon) {
        cogIcon.href = `about.html?username=${username}`;
    }
});

// Функція для отримання параметрів URL-адреси
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
