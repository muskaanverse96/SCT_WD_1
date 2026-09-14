/* =========================
   DOM ELEMENTS
   ========================= */

const searchInput = document.getElementById("searchInput");
const songCards = document.querySelectorAll(".song-card");
const favoriteCount = document.querySelector(".favorite-count");

const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerImage = document.getElementById("playerImage");
const playButton = document.getElementById("playButton");

const progressInput = document.querySelector(".progress input");
const progressFill = document.querySelector(".progress-fill");

const topNavigation = document.getElementById("topNavigation");
const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mainNav =
    document.querySelector(".top-navigation .main-nav");

const themeToggle =
    document.getElementById("themeToggle");

const favoritesList =
    document.getElementById("favoritesList");

const recentlyPlayedList =
    document.getElementById("recentlyPlayedList");


/* =========================
   VARIABLES
   ========================= */

let isPlaying = false;

let favorites =
    JSON.parse(localStorage.getItem("tunezzFavorites")) || [];

let recentlyPlayed =
    JSON.parse(localStorage.getItem("tunezzRecentlyPlayed")) || [];

let currentSongIndex = -1;


/* =========================
   SAVE DATA
   ========================= */

function saveData() {
    localStorage.setItem(
        "tunezzFavorites",
        JSON.stringify(favorites)
    );

    localStorage.setItem(
        "tunezzRecentlyPlayed",
        JSON.stringify(recentlyPlayed)
    );
}


/* =========================
   FAVORITE COUNT
   ========================= */

function updateFavoriteCount() {
    if (favoriteCount) {
        favoriteCount.textContent = favorites.length;
    }
}


/* =========================
   SEARCH SONGS
   ========================= */

if (searchInput) {
    searchInput.addEventListener("input", () => {

        const search =
            searchInput.value.toLowerCase().trim();

        let visibleSongs = 0;

        songCards.forEach(card => {

            const song =
                (card.dataset.song || "").toLowerCase();

            const language =
                (card.dataset.language || "").toLowerCase();

            const artist =
                card.querySelector("p")
                    ?.textContent
                    .toLowerCase() || "";

            const match =
                song.includes(search) ||
                language.includes(search) ||
                artist.includes(search);

            if (match) {
                card.style.display = "";
                visibleSongs++;
            } else {
                card.style.display = "none";
            }
        });

        const noResults =
            document.querySelector(".no-results");

        if (noResults) {
            noResults.style.display =
                visibleSongs === 0 && search !== ""
                    ? "block"
                    : "none";
        }
    });
}


/* =========================
   FILTER BY LANGUAGE
   ========================= */

function filterLanguage(language) {

    if (searchInput) {
        searchInput.value = language;
    }

    let found = false;

    songCards.forEach(card => {

        const cardLanguage =
            card.dataset.language || "";

        if (
            cardLanguage.toLowerCase() ===
            language.toLowerCase()
        ) {
            card.style.display = "";
            found = true;
        } else {
            card.style.display = "none";
        }
    });

    const noResults =
        document.querySelector(".no-results");

    if (noResults) {
        noResults.style.display =
            found ? "none" : "block";
    }

    const trending =
        document.getElementById("trending");

    if (trending) {
        trending.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* =========================
   SHOW ALL SONGS
   ========================= */

function showAllSongs() {

    if (searchInput) {
        searchInput.value = "";
    }

    songCards.forEach(card => {
        card.style.display = "";
    });

    const noResults =
        document.querySelector(".no-results");

    if (noResults) {
        noResults.style.display = "none";
    }
}


/* =========================
   GET SONG IMAGE
   ========================= */

function getSongImage(title) {

    const cards =
        document.querySelectorAll(".song-card");

    for (const card of cards) {

        const song =
            card.dataset.song || "";

        if (
            song.toLowerCase() ===
            title.toLowerCase()
        ) {

            const image =
                card.querySelector("img");

            if (image) {
                return image.src;
            }
        }
    }

    return "";
}


/* =========================
   RECENTLY PLAYED
   ========================= */

function addToRecentlyPlayed(
    title,
    artist,
    image
) {

    recentlyPlayed =
        recentlyPlayed.filter(
            song =>
                song.title.toLowerCase() !==
                title.toLowerCase()
        );

    recentlyPlayed.unshift({
        title: title,
        artist: artist,
        image: image
    });

    recentlyPlayed =
        recentlyPlayed.slice(0, 6);

    saveData();

    renderRecentlyPlayed();
}


/* =========================
   PLAY SONG
   ========================= */

function playSong(title, artist, image = "") {

    if (!playerTitle || !playerArtist) {
        return;
    }

    playerTitle.textContent = title;
    playerArtist.textContent = artist;

    if (!image) {
        image = getSongImage(title);
    }

    if (playerImage && image) {
        playerImage.src = image;
    }

    isPlaying = true;

    if (playButton) {
        playButton.innerHTML =
            '<i class="fa-solid fa-pause"></i>';
    }

    addToRecentlyPlayed(
        title,
        artist,
        image
    );

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   PLAY / PAUSE
   ========================= */

function togglePlayer() {

    isPlaying = !isPlaying;

    if (!playButton) {
        return;
    }

    if (isPlaying) {

        playButton.innerHTML =
            '<i class="fa-solid fa-pause"></i>';

    } else {

        playButton.innerHTML =
            '<i class="fa-solid fa-play"></i>';
    }
}


/* =========================
   PREVIOUS / NEXT SONG
   ========================= */

function changeSong(direction) {

    const cards =
        Array.from(
            document.querySelectorAll(".song-card")
        );

    if (cards.length === 0) {
        return;
    }

    if (currentSongIndex === -1) {
        currentSongIndex = 0;
    } else {
        currentSongIndex += direction;
    }

    if (currentSongIndex >= cards.length) {
        currentSongIndex = 0;
    }

    if (currentSongIndex < 0) {
        currentSongIndex =
            cards.length - 1;
    }

    const card =
        cards[currentSongIndex];

    const title =
        card.dataset.song ||
        card.querySelector("h3")?.textContent ||
        "Unknown Song";

    const artist =
        card.querySelector("p")?.textContent ||
        "Unknown Artist";

    const image =
        card.querySelector("img")?.src ||
        "";

    playSong(
        title,
        artist,
        image
    );
}


/* =========================
   FAVORITE SONG
   ========================= */

function toggleFavorite(button) {

    if (!button) {
        return;
    }

    const card =
        button.closest(".song-card");

    if (!card) {
        return;
    }

    const title =
        card.dataset.song ||
        card.querySelector("h3")?.textContent ||
        "";

    const artist =
        card.querySelector("p")?.textContent ||
        "";

    const image =
        card.querySelector("img")?.src ||
        "";

    const alreadyFavorite =
        favorites.some(
            song =>
                song.title.toLowerCase() ===
                title.toLowerCase()
        );

    if (alreadyFavorite) {

        favorites =
            favorites.filter(
                song =>
                    song.title.toLowerCase() !==
                    title.toLowerCase()
            );

        button.classList.remove("active");

        const icon =
            button.querySelector("i");

        if (icon) {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
        }

    } else {

        favorites.push({
            title: title,
            artist: artist,
            image: image
        });

        button.classList.add("active");

        const icon =
            button.querySelector("i");

        if (icon) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
        }
    }

    saveData();

    updateFavoriteCount();

    renderFavorites();
}


/* =========================
   SYNC FAVORITES
   ========================= */

function syncFavoriteButtons() {

    document
        .querySelectorAll(".song-card")
        .forEach(card => {

            const title =
                card.dataset.song ||
                card.querySelector("h3")?.textContent ||
                "";

            const button =
                card.querySelector(".favorite-btn");

            if (!button) {
                return;
            }

            const icon =
                button.querySelector("i");

            const isFavorite =
                favorites.some(
                    song =>
                        song.title.toLowerCase() ===
                        title.toLowerCase()
                );

            if (isFavorite) {

                button.classList.add("active");

                if (icon) {
                    icon.classList.remove("fa-regular");
                    icon.classList.add("fa-solid");
                }

            } else {

                button.classList.remove("active");

                if (icon) {
                    icon.classList.remove("fa-solid");
                    icon.classList.add("fa-regular");
                }
            }
        });
}


/* =========================
   RENDER FAVORITES
   ========================= */

function renderFavorites() {

    if (!favoritesList) {
        return;
    }

    if (favorites.length === 0) {

        favoritesList.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-heart"></i>

                <p>
                    No favorite songs yet.
                    Start adding songs you love!
                </p>
            </div>
        `;

        return;
    }

    favoritesList.innerHTML =
        favorites.map(song => {

            return `
                <div class="mini-song">

                    <img
                        src="${escapeHTML(song.image)}"
                        alt="${escapeHTML(song.title)}"
                    >

                    <div class="mini-song-info">

                        <h4>
                            ${escapeHTML(song.title)}
                        </h4>

                        <p>
                            ${escapeHTML(song.artist)}
                        </p>

                    </div>

                    <button
                        onclick="playSong(
                            '${escapeJS(song.title)}',
                            '${escapeJS(song.artist)}',
                            '${escapeJS(song.image)}'
                        )"
                    >
                        <i class="fa-solid fa-play"></i>
                    </button>

                </div>
            `;

        }).join("");
}


/* =========================
   RENDER RECENTLY PLAYED
   ========================= */

function renderRecentlyPlayed() {

    if (!recentlyPlayedList) {
        return;
    }

    if (recentlyPlayed.length === 0) {

        recentlyPlayedList.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <p>
                    Your recently played songs
                    will appear here.
                </p>

            </div>
        `;

        return;
    }

    recentlyPlayedList.innerHTML =
        recentlyPlayed.map(song => {

            return `
                <div class="mini-song">

                    <img
                        src="${escapeHTML(song.image)}"
                        alt="${escapeHTML(song.title)}"
                    >

                    <div class="mini-song-info">

                        <h4>
                            ${escapeHTML(song.title)}
                        </h4>

                        <p>
                            ${escapeHTML(song.artist)}
                        </p>

                    </div>

                    <button
                        onclick="playSong(
                            '${escapeJS(song.title)}',
                            '${escapeJS(song.artist)}',
                            '${escapeJS(song.image)}'
                        )"
                    >
                        <i class="fa-solid fa-play"></i>
                    </button>

                </div>
            `;

        }).join("");
}


/* =========================
   CLEAR FAVORITES
   ========================= */

function clearFavorites() {

    favorites = [];

    saveData();

    updateFavoriteCount();

    renderFavorites();

    syncFavoriteButtons();
}


/* =========================
   CLEAR RECENTLY PLAYED
   ========================= */

function clearRecentlyPlayed() {

    recentlyPlayed = [];

    saveData();

    renderRecentlyPlayed();
}


/* =========================
   ESCAPE HTML
   ========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   ESCAPE JAVASCRIPT
   ========================= */

function escapeJS(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}


/* =========================
   PROGRESS BAR
   ========================= */

if (progressInput) {

    progressInput.addEventListener(
        "input",
        () => {

            const value =
                progressInput.value;

            if (progressFill) {
                progressFill.style.width =
                    `${value}%`;
            }
        }
    );
}


/* =========================
   PLAYER CONTROLS
   ========================= */

const controlButtons =
    document.querySelectorAll(
        ".control-buttons button"
    );

controlButtons.forEach((button, index) => {

    button.addEventListener(
        "click",
        () => {

            if (index === 0) {

                changeSong(-1);

            } else if (index === 1) {

                togglePlayer();

            } else if (index === 2) {

                changeSong(1);

            } else if (index === 3) {

                shuffleSong(button);

            } else if (index === 4) {

                repeatSong(button);
            }
        }
    );
});


/* =========================
   SHUFFLE
   ========================= */

function shuffleSong(button) {

    const cards =
        document.querySelectorAll(".song-card");

    if (cards.length === 0) {
        return;
    }

    const randomIndex =
        Math.floor(
            Math.random() * cards.length
        );

    const card =
        cards[randomIndex];

    const title =
        card.dataset.song ||
        card.querySelector("h3")?.textContent ||
        "";

    const artist =
        card.querySelector("p")?.textContent ||
        "";

    const image =
        card.querySelector("img")?.src ||
        "";

    playSong(
        title,
        artist,
        image
    );

    if (button) {

        button.classList.add("active");

        setTimeout(() => {
            button.classList.remove("active");
        }, 500);
    }
}


/* =========================
   REPEAT
   ========================= */

function repeatSong(button) {

    if (!button) {
        return;
    }

    button.classList.toggle("active");
}


/* =========================
   PLAYER HEART
   ========================= */

const playerHeart =
    document.querySelector(".player-heart");

if (playerHeart) {

    playerHeart.addEventListener(
        "click",
        () => {

            const title =
                playerTitle
                    ? playerTitle.textContent
                    : "";

            if (
                !title ||
                title === "Choose a song"
            ) {
                return;
            }

            const artist =
                playerArtist
                    ? playerArtist.textContent
                    : "";

            const image =
                playerImage
                    ? playerImage.src
                    : "";

            const exists =
                favorites.some(
                    song =>
                        song.title.toLowerCase() ===
                        title.toLowerCase()
                );

            if (exists) {

                favorites =
                    favorites.filter(
                        song =>
                            song.title.toLowerCase() !==
                            title.toLowerCase()
                    );

                playerHeart.classList.remove(
                    "active"
                );

            } else {

                favorites.push({
                    title: title,
                    artist: artist,
                    image: image
                });

                playerHeart.classList.add(
                    "active"
                );
            }

            saveData();

            updateFavoriteCount();

            renderFavorites();

            syncFavoriteButtons();
        }
    );
}


/* =========================
   NAVBAR SCROLL EFFECT
   ========================= */

window.addEventListener(
    "scroll",
    () => {

        if (!topNavigation) {
            return;
        }

        if (window.scrollY > 30) {

            topNavigation.classList.add(
                "scrolled"
            );

        } else {

            topNavigation.classList.remove(
                "scrolled"
            );
        }
    }
);

/* =========================
   MOBILE MENU
   ========================= */

function openMobileMenu() {

    if (!mainNav) {
        return;
    }

    mainNav.classList.add(
        "mobile-open"
    );

    if (mobileMenuButton) {

        mobileMenuButton.innerHTML =
            '<i class="fa-solid fa-xmark"></i>';
    }
}


function closeMobileMenu() {

    if (!mainNav) {
        return;
    }

    mainNav.classList.remove(
        "mobile-open"
    );

    if (mobileMenuButton) {

        mobileMenuButton.innerHTML =
            '<i class="fa-solid fa-bars"></i>';
    }
}


if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            if (
                mainNav &&
                mainNav.classList.contains(
                    "mobile-open"
                )
            ) {

                closeMobileMenu();

            } else {

                openMobileMenu();
            }
        }
    );
}


/* Close menu after navigation */

navLinks.forEach(link => {

    link.addEventListener(
        "click",
        () => {
            closeMobileMenu();
        }
    );
});


/* Close menu when clicking outside */

document.addEventListener(
    "click",
    event => {

        if (
            !mainNav ||
            !mobileMenuButton
        ) {
            return;
        }

        const clickedInsideNav =
            mainNav.contains(event.target);

        const clickedButton =
            mobileMenuButton.contains(
                event.target
            );

        if (
            mainNav.classList.contains(
                "mobile-open"
            ) &&
            !clickedInsideNav &&
            !clickedButton
        ) {

            closeMobileMenu();
        }
    }
);


/* =========================
   THEME TOGGLE
   ========================= */

function setTheme(theme) {

    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );
    }

    localStorage.setItem(
        "tunezzTheme",
        theme
    );

    updateThemeIcon();
}


function updateThemeIcon() {

    if (!themeToggle) {
        return;
    }

    const icon =
        themeToggle.querySelector("i");

    if (!icon) {
        return;
    }

    if (
        document.body.classList.contains(
            "light-theme"
        )
    ) {

        icon.className =
            "fa-solid fa-moon";

    } else {

        icon.className =
            "fa-solid fa-sun";
    }
}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const isLight =
                document.body.classList.contains(
                    "light-theme"
                );

            setTheme(
                isLight
                    ? "dark"
                    : "light"
            );
        }
    );
}


/* =========================
   FAVORITES NAVIGATION
   ========================= */

const favoriteNavButton =
    document.querySelector(
        ".favorite-nav-btn"
    );

if (favoriteNavButton) {

    favoriteNavButton.addEventListener(
        "click",
        () => {

            const favoritesSection =
                document.getElementById(
                    "favorites"
                );

            if (favoritesSection) {

                favoritesSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    );
}


/* =========================
   INITIAL LOAD
   ========================= */

const savedTheme =
    localStorage.getItem(
        "tunezzTheme"
    );

if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );
}

renderFavorites();

renderRecentlyPlayed();

updateFavoriteCount();

syncFavoriteButtons();

updateThemeIcon();


/* =========================
   INITIAL NAVBAR STATE
   ========================= */

if (
    window.scrollY > 30 &&
    topNavigation
) {

    topNavigation.classList.add(
        "scrolled"
    );
}

/* Navbar scroll effect */

window.addEventListener("scroll", () => {

    if (window.scrollY > 30) {
        topNavigation.classList.add("scrolled");
    } else {
        topNavigation.classList.remove("scrolled");
    }

});


/* Active navigation */

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

    });

});