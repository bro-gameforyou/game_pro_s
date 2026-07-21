const gamesContainer = document.getElementById("games");
const searchInput = document.getElementById("search");

let games = [];

fetch("games.json")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        games = data;
        displayGames(games);
    })
    .catch(function(error) {
        console.log("خطا:", error);
    });

function displayGames(list) {

    gamesContainer.innerHTML = "";

    for (let i = 0; i < list.length; i++) {

        const game = list[i];

        const card = document.createElement("div");
        card.className = "card";

        const image = document.createElement("img");
        image.src = game.image;
        image.alt = game.name;

        const title = document.createElement("h3");
        title.textContent = game.name;

        card.appendChild(image);
        card.appendChild(title);

        card.onclick = function () {
            window.location.href = game.link;
        };

        gamesContainer.appendChild(card);
    }
}

searchInput.addEventListener("input", function () {

    const value = searchInput.value.toLowerCase();

    const result = games.filter(function (game) {
        return game.name.toLowerCase().includes(value);
    });

    displayGames(result);

});