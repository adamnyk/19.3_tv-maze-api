"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
	const response = await axios.get("https://api.tvmaze.com/search/shows", {
		params: { q: term },
	});

	return response.data;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
	$showsList.empty();

	for (let show of shows) {
		const $show = $(
			`<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
        	 <div class="media">
           	<img src="${
							show.show.image
								? show.show.image.medium
								: "https://tinyurl.com/tv-missing"
						}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
              <button class="btn btn-outline-dark btn-sm get-eipsodes">
              Episodes
             </button>
           </div>
         </div>  
       </div>
      `
		);

		$showsList.append($show);
	}
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
	const term = $("#search-query").val();
	const shows = await getShowsByTerm(term);

	$episodesArea.hide();
	populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
	evt.preventDefault();
	await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
	const response = await axios.get(
		`https://api.tvmaze.com/shows/${id}/episodes`
	);
	return response.data;
}

/** Given a list of episodes, create marekup and append to DOM*/
function populateEpisodes(episodes) {
	$("#episodes-list").empty();

	for (let episode of episodes) {
		const $episode = $(
			`<li><a href="${episode?.url}">${episode.name}</a> (Season: ${episode.season}, Episode: ${episode.number})</li>`
		);
		$("#episodes-list").append($episode);
	}
}

/** Get episodes from API and display.
 * 		Show episodes area
 */
async function searchForEpisodesAndDisplay(id) {
	const episodes = await getEpisodesOfShow(id);
	$episodesArea.show();
	populateEpisodes(episodes);
}

$("#shows-list").on("click", "button", async (evt) => {
	const id = $(evt.target).closest("div.Show").data("show-id");
	await searchForEpisodesAndDisplay(id);
});
