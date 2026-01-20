const searchInput      = document.getElementById('search-input');       
const searchBtn        = document.getElementById('search-btn');        
const clearBtn         = document.getElementById('clear-btn');        
const genreSelect      = document.getElementById('genre-select');       
const resultsContainer = document.getElementById('results-container');  
const errorBox         = document.getElementById('error-box');         
let allShows = [];

// show an error message on the page
function showError(message) {
    errorBox.textContent = message;  
    errorBox.style.display = 'block'; 
}

// hide the error message
function clearError() {
    errorBox.textContent = '';        
    errorBox.style.display = 'none'; 
}

// event listener when the user clicks the "Search" button
searchBtn.addEventListener('click', searchShows);

// When the user presses Enter key 
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchShows();
    }
});

// event listener when the user changes the selected genre
genreSelect.addEventListener('change', filterByGenre);

// event listener when the user clicks the Clear button
clearBtn.addEventListener('click', function () {
    clearResults();      
    clearError();       
    searchInput.value = '';
    genreSelect.value = '';
    allShows = [];      
});

// function runs when the user searches for a TV show
function searchShows() {
    const query = searchInput.value.trim(); // trim extra spaces
    clearError(); // clear old errors

    // if the user didnt type anything
    if (!query) {
        showError('Please enter a TV show name to search');
        return;
    }
    clearResults(); 
    const url = 'https://api.tvmaze.com/search/shows?q=' + encodeURIComponent(query);

    // send a request to the TVMaze API
    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network problem');
            }
            return response.json();
        })
        .then(function (data) {
            // no shows found
            if (data.length === 0) {
                showError('No TV shows found with that name');
                return;
            }
            allShows = data;    
            displayShows(data); // show results on the page
        })
        .catch(function (error) {
            console.error('API error:', error);
            showError('Network problem try again later');
        });
}

// filters the shows based on the user selected genre
function filterByGenre() {
    const selectedGenre = genreSelect.value;
    clearError(); // clear old errors

    // if "All Genres" is selected
    if (!selectedGenre) {
        if (allShows.length > 0) {
            clearResults();
            displayShows(allShows);
        }
        return;
    }
    const filteredShows = [];

    // loop through all shows and pick only the ones that match the chosen genre 
    for (let i = 0; i < allShows.length; i++) {
        const showData = allShows[i];
        const show = showData.show;
        if (show.genres && show.genres.indexOf(selectedGenre) !== -1) {
            filteredShows.push(showData);
        }
    }
    clearResults();

    // no shows in this genre
    if (filteredShows.length === 0) {
        showError('No shows found in the ' + selectedGenre + ' genre');
        return;
    }
    displayShows(filteredShows);
}

// creates and shows the TV show cards
function displayShows(shows) {
    for (let i = 0; i < shows.length; i++) {
        const showData = shows[i];
        const show = showData.show;
        // create  card
        const showCard = document.createElement('div');
        showCard.className = 'show-card';
        // get the show information 
        const showImage    = show.image ? (show.image.original || show.image.medium): 'https://via.placeholder.com/210x295/000000/e50914?text=No+Image';
        const showName     = show.name || 'Unknown';
        const showLanguage = show.language || 'Unknown';
        const showGenres   = (show.genres && show.genres.length > 0) ? show.genres.join(', ') : 'Unknown';
        const showStatus   = show.status || 'Unknown';
        const showRating   = (show.rating && show.rating.average) ? (show.rating.average + '/10') : 'No rating';
        let showSummary = show.summary
            ? show.summary.replace(/<[^>]*>/g, '') // remove HTML tags from summary
            : 'No summary available.';
        // shorten long summaries to fit in the card
        if (showSummary.length > 180) {
            showSummary = showSummary.substring(0, 180) + '...';
        }

        // insert into the card
        showCard.innerHTML = `
            <img src="${showImage}" alt="${showName}" class="show-image">
            <div class="show-info">
                <h3 class="show-title">${showName}</h3>
                <div class="show-details">
                    <p><span class="detail-label">Language:</span> ${showLanguage}</p>
                    <p><span class="detail-label">Genres:</span> ${showGenres}</p>
                    <p><span class="detail-label">Status:</span> ${showStatus}</p>
                    <p><span class="detail-label">Rating:</span> ${showRating}</p>
                </div>
                <div class="show-summary">
                    <p>${showSummary}</p>
                </div>
            </div>
        `;
        // add the card to the results container
        resultsContainer.appendChild(showCard);
    }
}

// removes all show cards from the page
function clearResults() {
    while (resultsContainer.firstChild) {
        resultsContainer.removeChild(resultsContainer.firstChild);
    }
}
