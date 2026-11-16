
const gamesContainer = document.getElementById("games");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sortSelect");
const filters = document.getElementById("filters");

const totalCount = document.getElementById("totalCount");
const resultText = document.getElementById("resultText");
const heroCount = document.getElementById("heroCount");
const toast = document.getElementById("toast");

let games = [];
let activeCategory = "all";
let favorites = JSON.parse(localStorage.getItem("gps_favorites") || "[]");

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/\u200c/g, " ")
        .trim();
}

function saveFavorites() {
    localStorage.setItem("gps_favorites", JSON.stringify(favorites));
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function getFilteredGames() {
    const query = normalize(searchInput.value);

    let result = games.filter(game => {
        const matchesSearch =
            normalize(game.name).includes(query);

        const matchesCategory =
            activeCategory === "all" ||
            (activeCategory === "موردعلاقه"
                ? favorites.includes(game.name)
                : game.category === activeCategory);

        return matchesSearch && matchesCategory;
    });

    if (sortSelect.value === "az") {
        result.sort((a, b) =>
            a.name.localeCompare(b.name, "fa")
        );
    }

    if (sortSelect.value === "za") {
        result.sort((a, b) =>
            b.name.localeCompare(a.name, "fa")
        );
    }

    return result;
}

function createCard(game, index) {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${Math.min(index * 45, 350)}ms`;

    const imageBox = document.createElement("div");
    imageBox.className = "card-image";

    const image = document.createElement("img");
    image.src = game.image;
    image.alt = game.name;
    image.loading = "lazy";
    image.decoding = "async";

    image.onerror = function () {
        image.style.display = "none";
        imageBox.style.background =
            "linear-gradient(135deg,#493a80,#a64d89)";
    };

    const number = document.createElement("span");
    number.className = "card-number";
    number.textContent = `GAME ${String(games.indexOf(game) + 1).padStart(2, "0")}`;

    const favorite = document.createElement("button");
    favorite.className = "favorite-btn";
    favorite.type = "button";

    const isFavorite = favorites.includes(game.name);
    favorite.textContent = isFavorite ? "♥" : "♡";

    if (isFavorite) favorite.classList.add("active");

    favorite.title = "افزودن به علاقه‌مندی‌ها";
    favorite.setAttribute(
        "aria-label",
        `علاقه‌مندی ${game.name}`
    );

    favorite.addEventListener("click", function (event) {
        event.stopPropagation();

        if (favorites.includes(game.name)) {
            favorites = favorites.filter(name => name !== game.name);
            showToast("از علاقه‌مندی‌ها حذف شد");
        } else {
            favorites.push(game.name);
            showToast("به علاقه‌مندی‌ها اضافه شد ❤️");
        }

        saveFavorites();
        renderGames();
    });

    imageBox.append(image, number, favorite);

    const info = document.createElement("div");
    info.className = "card-info";

    const textBox = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = game.name;

    const category = document.createElement("span");
    category.className = "category-tag";
    category.textContent = game.category || "سرگرمی";

    textBox.append(title, category);

    const play = document.createElement("button");
    play.className = "play-btn";
    play.type = "button";
    play.textContent = "بازی کن ←";

    play.addEventListener("click", function () {
        window.location.href = game.link;
    });

    info.append(textBox, play);
    card.append(imageBox, info);

    return card;
}

function renderGames() {
    const result = getFilteredGames();

    gamesContainer.innerHTML = "";

    totalCount.textContent = `${games.length} بازی`;
    resultText.textContent =
        `نمایش ${result.length} بازی از ${games.length} بازی`;

    if (result.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";

        const icon = document.createElement("strong");
        icon.textContent = "🔎";

        const message = document.createElement("p");
        message.textContent =
            "هیچ بازی‌ای پیدا نشد! عبارت جستجو یا فیلتر رو تغییر بده.";

        empty.append(icon, message);
        gamesContainer.appendChild(empty);
        return;
    }

    result.forEach((game, index) => {
        gamesContainer.appendChild(createCard(game, index));
    });
}

async function loadGames() {
    try {
        const response = await fetch("games.json");

        if (!response.ok) {
            throw new Error("خطا در دریافت فایل بازی‌ها");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("ساختار فایل بازی‌ها معتبر نیست");
        }

        games = data.filter(game =>
            game &&
            typeof game.name === "string" &&
            typeof game.image === "string" &&
            typeof game.link === "string"
        );

        heroCount.textContent = games.length.toLocaleString("fa-IR");

        renderGames();

    } catch (error) {
        console.error(error);

        gamesContainer.innerHTML = `
            <div class="empty">
                <strong>⚠️</strong>
                <p>بازی‌ها بارگذاری نشدند. فایل games.json را بررسی کن.</p>
                <button class="play-btn" onclick="location.reload()">
                    تلاش دوباره
                </button>
            </div>
        `;

        resultText.textContent = "خطا در بارگذاری";
    }
}

// جستجو
searchInput.addEventListener("input", renderGames);

// مرتب‌سازی
sortSelect.addEventListener("change", renderGames);

// دسته‌بندی
filters.addEventListener("click", function (event) {
    const button = event.target.closest(".filter");

    if (!button) return;

    activeCategory = button.dataset.category;

    document.querySelectorAll(".filter").forEach(item => {
        item.classList.remove("active");
    });

    button.classList.add("active");

    renderGames();
});

// بازی تصادفی
document.getElementById("randomBtn").addEventListener("click", function () {
    const availableGames = getFilteredGames();

    if (!availableGames.length) {
        showToast("بازی‌ای برای انتخاب وجود ندارد!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableGames.length);
    const selectedGame = availableGames[randomIndex];

    showToast(`بازی انتخاب‌شده: ${selectedGame.name}`);

    setTimeout(() => {
        window.location.href = selectedGame.link;
    }, 700);
});

// تغییر تم
const themeBtn = document.getElementById("themeBtn");

function setTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    themeBtn.textContent = theme === "light" ? "🌙" : "☀️";
    localStorage.setItem("gps_theme", theme);
}

setTheme(localStorage.getItem("gps_theme") || "dark");

themeBtn.addEventListener("click", function () {
    const nextTheme =
        document.body.classList.contains("light") ? "dark" : "light";

    setTheme(nextTheme);
    showToast(nextTheme === "light" ? "حالت روشن فعال شد ☀️" : "حالت تاریک فعال شد 🌙");
});

// میانبر کیبورد برای جستجو
document.addEventListener("keydown", function (event) {
    const typing =
        event.target.matches("input, textarea, select") ||
        event.target.isContentEditable;

    if (event.key === "/" && !typing) {
        event.preventDefault();
        searchInput.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        searchInput.blur();
        renderGames();
    }
});

// سال جاری
document.getElementById("year").textContent =
    new Date().getFullYear();

// شروع
loadGames();
