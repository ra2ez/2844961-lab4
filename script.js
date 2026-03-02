const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

loadingSpinner.classList.add('hidden');
errorMessage.classList.add('hidden');

async function searchCountry(countryName) {
    try {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
        countryInfo.innerHTML = '';
        borderingCountries.innerHTML = '';

     
        loadingSpinner.classList.remove('hidden');

        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        if (!response.ok) {
            throw new Error('Not found');
        }
        const data = await response.json();
        const country = data[0];

        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital[0]}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
        `;

 
        if (country.borders && country.borders.length > 0) {
            const borderPromises = country.borders.map(code =>
                fetch(`https://restcountries.com/v3.1/alpha/${code}`).then(res => res.json())
            );

            const borderResults = await Promise.all(borderPromises);

            borderingCountries.innerHTML = borderResults.map(result => {
                const borderCountry = result[0];
                return `
                    <div>
                        <p>${borderCountry.name.common}</p>
                        <img src="${borderCountry.flags.svg}" alt="${borderCountry.name.common} flag">
                    </div>
                `;
            }).join('');
        } else {
            borderingCountries.innerHTML = '<p>No bordering countries.</p>';
        }

    } catch (error) {

        errorMessage.textContent = 'Could not find that country. Please try again.';
        errorMessage.classList.remove('hidden');
    } finally {
   
        loadingSpinner.classList.add('hidden');
    }
}

searchBtn.addEventListener('click', () => {
    const country = countryInput.value.trim();
    searchCountry(country);
});

countryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchCountry(countryInput.value.trim());
    }
});
