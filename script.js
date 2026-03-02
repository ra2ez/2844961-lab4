const url = "https://restcountries.com/v3.1/name/";

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

document.addEventListener('DOMContentLoaded', function() {
    // FIXED: Use the required IDs from the lab spec
    const button = document.getElementById("search-btn"); 
    const countryInput = document.getElementById("country-input");
    const countryInfo = document.getElementById("country-info");
    const borderingCountries = document.getElementById("bordering-countries");
    const loadingSpinner = document.getElementById("loading-spinner");
    const errorMessage = document.getElementById("error-message");

    // Helper function to toggle visibility
    function showElement(element) {
        element.classList.remove('hidden');
    }
    function hideElement(element) {
        element.classList.add('hidden');
    }

    button.addEventListener('click', async function() {
        const country = countryInput.value.trim();

        // Input Validation
        if (country === "" || !/^[a-zA-Z\s]+$/.test(country)) {
            // FIXED: Use DOM error element instead of alert
            errorMessage.textContent = "Please enter a valid country name.";
            showElement(errorMessage);
            return;
        }

        // Reset UI
        hideElement(errorMessage);
        countryInfo.innerHTML = "";
        borderingCountries.innerHTML = "";
        showElement(loadingSpinner); // Show spinner

        try {
            // 1. Fetch Main Country
            const response = await fetch(url + country);
            if (!response.ok) throw new Error("Country not found");
            
            const data = await response.json();
            const mainCountry = data[0];

            // Update Main Info
            // FIXED: Added toLocaleString() for population
            countryInfo.innerHTML = `
                <h2>${mainCountry.name.common}</h2>
                <img src="${mainCountry.flags.svg}" alt="Flag">
                <p><strong>Capital:</strong> ${mainCountry.capital ? mainCountry.capital[0] : 'N/A'}</p>
                <p><strong>Population:</strong> ${mainCountry.population.toLocaleString()}</p>
                <p><strong>Region:</strong> ${mainCountry.region}</p>
            `;
            showElement(countryInfo);

            // 2. Fetch Neighbors
            const neighbors = mainCountry.borders || [];
            if (neighbors.length === 0) {
                borderingCountries.innerHTML = '<p style="grid-column: 1 / -1;">No bordering countries.</p>';
            } else {
                // Re-using your smart chunking logic
                const chunks = chunkArray(neighbors, 5);
                let neighborHTML = '';
                
                for (const chunk of chunks) {
                    const codes = chunk.join(',');
                    const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codes}`);
                    const neighborData = await res.json();
                    
                    neighborData.forEach(n => {
                        neighborHTML += `
                            <div class="border-item">
                                <img src="${n.flags.svg}" alt="${n.name.common}">
                                <p>${n.name.common}</p>
                            </div>
                        `;
                    });
                }
                borderingCountries.innerHTML = neighborHTML;
            }
            showElement(borderingCountries);

        } catch (error) {
            errorMessage.textContent = error.message;
            showElement(errorMessage);
            hideElement(countryInfo);
            hideElement(borderingCountries);
        } finally {
            // Always hide spinner when done
            hideElement(loadingSpinner);
        }
    });
});
