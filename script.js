const url = "https://restcountries.com/v3.1/name/";

// splits the neighbourList into smaller lists to make requests easier
function chunkArray(array, chunkSize) { 
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}


// ensures that DOM Manipulation code only runs when the DOM is ready
document.addEventListener('DOMContentLoaded', function() { 

    // getting all the DOM elements
    const button = document.getElementById("submit-button");
    const countryInput = document.getElementById("country-input");
    const countryInfo = document.getElementById("country-info");
    const borderingCountries = document.getElementById("bordering-countries");

    // once the submit button is clicked
    button.addEventListener('click', async function() {
        const country = countryInput.value.trim();  // getting country that was typed in

        if (country === null || country === "" || !/^[a-zA-Z\s]+$/.test(country)) {   //ensures that user types in a country
            alert("Please enter a country");
            return;
        }

        // resets these elements so that new data can be displayed
        countryInfo.innerHTML = "";
        borderingCountries.innerHTML = "";

        async function getData() {  // function to fetch the data about the country from the API
            try {
                const response = await fetch(url + country);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Country not found");
                    } else {
                    throw new Error("Failed to fetch data");
                    }   
                }

                const data = await response.json();
                console.log(data);
                return data;
            } catch (error) {
                console.error(error.message);
                alert(error.message);
                return null;
            }
        }

        const data = await getData(); // call the function

        if (data != null){

            // retrieving the required data from the response
            const countryName = data[0].name.common;
            const countryCapital = data[0].capital[0];
            const countryPopulation = data[0].population;
            const countryRegion = data[0].region;
            const countryFlag = data[0].flags.png;
            const countryNeighbours = data[0].borders || [];

            // displaying the required data about the country
            countryInfo.innerHTML = 
            `<article>
            <h1>${countryName}</h1>
            <p>Capital: ${countryCapital}</p>
            <p>Population: ${countryPopulation}</p>
            <p>Region: ${countryRegion}</p>
            <img src="${countryFlag}">
            </article>`;

            // special case for islands
            if (countryNeighbours.length === 0){
                borderingCountries.innerHTML = `<p>No bordering countries</p>`
            }

            // fetching data for each of the neighbouring countries 
            async function getNeighbourData(countryNeighbours) { 
                const chunkSize = 5; // Number of countries to fetch per request
                const chunks = chunkArray(countryNeighbours, chunkSize);

                try {
                    const allNeighbours = [];
                    for (const chunk of chunks) {
                        const codes = chunk.join(',');
                        const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codes}`);
                        if (!response.ok) {
                            throw new Error("Failed to fetch data for neighbouring countries");   
                        }
    
                        const neighbourData = await response.json();
                        allNeighbours.push(...neighbourData);
                        console.log(neighbourData);
                    }   
                    return allNeighbours;
                } catch (error) {
                    console.error(error.message);
                    throw error;
                }
            }

            const neighbourData = await getNeighbourData(countryNeighbours);

            // displaying data of the neighbours
            if (neighbourData != null) {
                let neighbourContent = '';
                for (const neighbour of neighbourData) {
                    const neighbourName = neighbour.name.common;
                    const neighbourFlag = neighbour.flags.png;
                    neighbourContent +=
                    `<article class="neighbour">
                    <figure>
                    <img src="${neighbourFlag}">
                    <figcaption>${neighbourName}</figcaption>
                    </figure>
                    </article> 
                    `;
                };
                borderingCountries.innerHTML += neighbourContent;
            };
        };
    });
});