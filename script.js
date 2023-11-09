const apiEndpoint = "https://api-gateway.skymavis.com/graphql/marketplace";
const apiKey = "plPOeccBmsoqRqkTnDNfsgdzD420jwBA";

async function fetchRecentAuctions() {
    const query = `
    query MyQuery {
        settledAuctions {
            axies {
                results {
                    id
                    class
                    breedCount
                    birthDate
                    parts {
                        name
                        class
                    }
                    transferHistory {
                        results {
                            withPrice
                            withPriceUsd
                            timestamp
                        }
                    }
                    stage
                }
            }
        }
    }
    `;

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        return jsonResponse.data.settledAuctions.axies.results;
    } catch (error) {
        console.error('Error fetching GraphQL data:', error);
    }
}

function renderAxies(axies) {
    const container = document.getElementById('axies-container');
    container.innerHTML = ''; // Clear existing content

    axies.forEach(axie => {
        const axieImageUrl = `https://assets.axieinfinity.com/axies/${axie.id}/axie/axie-full-transparent.png`;

        const axieElement = document.createElement('div');
        axieElement.className = 'axie';
        axieElement.innerHTML = `
            <img src="${axieImageUrl}" alt="Axie #${axie.id}" class="axie-image">
            <h2>Axie ID: ${axie.id}</h2>
            <p>Sale Date: ${new Date(axie.transferHistory.results[0].timestamp * 1000).toLocaleString()}</p>
            <p>Birth Date: ${new Date(axie.birthDate * 1000).toLocaleString()}</p>
            <p>Class: ${axie.class}</p>
            <p>USD Price: ${axie.transferHistory.results[0].withPriceUsd}</p>
            <p>ETH Price: ${parseInt(axie.transferHistory.results[0].withPrice) / 1e18} ETH</p>
            <div class="parts">
                ${axie.parts.map(part => `<p>${part.name} </p>`).join('')}
            </div>
        `;
        container.appendChild(axieElement);
    });
}

fetchRecentAuctions().then(renderAxies);
