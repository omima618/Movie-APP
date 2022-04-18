// ELEMENTS
const scrollBtn = document.querySelector(".scroll-top");
const moviesContainer = document.querySelector(".movies-container");
const tagsContainer = document.querySelector(".genres");
const from = document.getElementById("form");
const submitBtn = document.querySelector(".submit-search");
const clearBtn = document.querySelector(".clear-all");

// API
const API_KEY = "api_key=2f527450f3c2e3f223d0348f069917c6";
const BASE_API = "https://api.themoviedb.org/3";
const MOST_POPULAR_URL = "/discover/movie?sort_by=popularity.desc";
const API_URL = ` ${BASE_API}${MOST_POPULAR_URL}&${API_KEY}`;
let selectedGenres = [];
const defaulErrorMsg = "Something went wrong ❗";

// show scroll top button
window.addEventListener("scroll", () => {
    if (window.scrollY >= 400) scrollBtn.classList.remove("hide");
    else scrollBtn.classList.add("hide");
});
scrollBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
});

// generate movie markup
function voteColor(result) {
    if (result.vote_average >= 8) {
        return `green`;
    }
    if (result.vote_average >= 5) {
        return `orange`;
    }
    if (result.vote_average < 5) {
        return `red`;
    }
}
function generateMarkup(result) {
    let moviePoster = "https://image.tmdb.org/t/p/w500/" + result.poster_path;
    if (!result.poster_path) moviePoster = "images/default-img.jpg";
    const voteClass = voteColor(result);
    return `
    <div class="movie" id="${result.id}">
        <div class="movie-img">
            <img src="${moviePoster}"
            alt="movie-poster">
        </div>
        <div class="movie-info">
            <h3>${result.original_title}</h3>
            <span class="${voteClass}">${result.vote_average}</span>
        </div>
        <div class="overview">
            <h4>Overview</h4>
            <p>${result.overview ? result.overview : "....."}</p>
        </div>
</div>
    `;
}

// render movie
function renderMovies(movies) {
    moviesContainer.innerHTML = "";
    moviesContainer.append();
    movies.forEach((movie) => {
        const markup = generateMarkup(movie);
        moviesContainer.insertAdjacentHTML("beforeend", markup);
    });
}

// get movies from the api
async function getMovies(url, errMsg = defaulErrorMsg) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(errMsg);
        const data = await res.json();
        const allMovies = data.results;
        if (allMovies.length === 0) {
            moviesContainer.innerHTML = `<div class="error">${errMsg}</div>`;
            return;
        }
        renderMovies(allMovies);
    } catch (err) {
        moviesContainer.innerHTML = `<div class="error">${err}</div>`;
    }
}
getMovies(API_URL);

// get movies with query
function submitHandler(e) {
    e.preventDefault();
    const query = from.querySelector("#search").value;
    if (!query) {
        getMovies(API_URL);
        return;
    }
    const generatedURL = `${BASE_API}/search/movie?${API_KEY}&query=${query}`;
    getMovies(generatedURL);
    from.querySelector("#search").value = "";
    clearGenres();
}

from.addEventListener("submit", submitHandler);
submitBtn.addEventListener("click", submitHandler);

// get tags
function renderTags(genres) {
    const errorMsg = `<div class="error"${defaulErrorMsg}</div>`;
    if (genres.length === 0) {
        tagsContainer.insertAdjacentHTML("beforeend", errorMsg);
        return;
    }
    genres.forEach((genre) => {
        const genreMarkup = `<div class="genre" id="${genre.id}">${genre.name}</div>`;
        tagsContainer.insertAdjacentHTML("beforeend", genreMarkup);
    });
}
async function getTags() {
    try {
        const url = `${BASE_API}/genre/movie/list?${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(defaulErrorMsg);
        const genresData = await response.json();
        const genres = genresData.genres;
        renderTags(genres);
    } catch (err) {
        tagsContainer.innerHTML = `<div class="error">${err}</div>`;
    }
}
getTags();

// get movies with genres
const renderMoviesByGenres = function (selectedGeners) {
    if (selectedGeners.length === 0) {
        getMovies(API_URL);
    } else {
        const url = ` ${API_URL}&with_genres=${encodeURI(
            selectedGeners.join(",")
        )}`;
        getMovies(url, "No results found ❗");
    }
};

// handle tags
function controlClearBtn() {
    if (selectedGenres.length === 0) clearBtn.classList.add("hide");
    else clearBtn.classList.remove("hide");
}

function clearGenres() {
    const allGenres = document.querySelectorAll(".genre");
    selectedGenres = [];
    allGenres.forEach((genre) => genre.classList.remove("selected"));
    controlClearBtn();
}

function checkGenerId(selectedGenres, id) {
    if (selectedGenres.includes(id)) {
        const idIndex = selectedGenres.indexOf(id);
        selectedGenres.splice(idIndex, 1);
        renderMoviesByGenres(selectedGenres);
        document.getElementById(id).classList.remove("selected");
    } else {
        selectedGenres.push(id);
        renderMoviesByGenres(selectedGenres);
        document.getElementById(id).classList.add("selected");
    }
}

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("genre")) return;
    const generId = +e.target.id;
    checkGenerId(selectedGenres, generId);
    controlClearBtn();
});

clearBtn.addEventListener("click", () => {
    clearGenres();
    getMovies(API_URL);
});
