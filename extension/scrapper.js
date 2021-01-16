//@ts-check

const FOOD_NETWORK_BASE_URL = 'https://www.foodnetwork.com/search/';
const FOOD_NETWORK_SUFFIX = "-/CUSTOM_FACET:RECIPE_FACET";  // Search for ONLY recipes

/**
 * @typedef RecipeResult
 * @property {string} name Name of the recipe
 * @property {string} author Author of the recipe
 * @property {string} link Link to the recipe
 * @property {string} [image] Image of the completed recipe
 * @property {number} rating Rating out of 5 of the recipe
 * @property {number} reviews Total amount of reviews for the recipe
 */

/**
 * @param {string} keywords Keywords to search websites for
 * @returns {Promise<RecipeResult[]>} Array of recipes sorted in descending order by rating and then by reviews
 */
const searchForRecipes = async keywords => {
    const response = await fetch(`${FOOD_NETWORK_BASE_URL}${keywords}${FOOD_NETWORK_SUFFIX}`);
    const doc = new DOMParser().parseFromString((await response.text()), 'text/html');
    const recipeElements = doc.querySelectorAll('.o-RecipeResult');
    return Array.from(recipeElements).map(element => {
        const headerElement = element.querySelector('.m-MediaBlock__a-HeadlineText');

        const name = headerElement.textContent;
        const link = headerElement.parentElement.getAttribute('href');
        const image = element.querySelector('.m-MediaBlock__a-Image') ? element.querySelector('.m-MediaBlock__a-Image').getAttribute('src') : null;
        const author = element.querySelector('.m-Info__a-AssetInfo').textContent.replace('Courtesy of ', ''); // "Courtesy of AUTHOR_NAME" so we have to get rid of the courtesy part
        const rating = element.querySelectorAll('.gig-rating-star-full').length;
        const reviews = element.querySelector('.gig-rating-ratingsum') ? parseInt(element.querySelector('.gig-rating-ratingsum').textContent.replace(/\D/g, '')) : 0;

        return {
            name,
            author,
            link,
            image,
            rating,
            reviews
        };

    }).sort((a, b) => {                 // Sort in descending order by rating and then by reviews
        if (b.rating === a.rating) {
            return b.reviews - a.reviews;
        }
        return b.rating - a.rating;
    });
};