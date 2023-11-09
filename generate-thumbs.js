const apiEndpoint = "https://api-gateway.skymavis.com/graphql/marketplace";
const apiKey = "plPOeccBmsoqRqkTnDNfsgdzD420jwBA";
const salePriceThreshold = 0.0075; 

let allAxiesCount = 0;
let expensiveAxiesCount = 0;

// Set the time interval for refresh (30000 milliseconds equals 30 seconds)
const refreshInterval = 60000;

// Define the function to refresh the page
function refreshPage() {
    window.location.reload();
}

// Set the interval to refresh the page every 30 seconds after the page has loaded
window.addEventListener('load', () => {
    setInterval(refreshPage, refreshInterval);
});

const classColors = {
    beast: 'rgb(255,236,81)',
    bird: 'rgb(255,180,187)',
    aquatic: 'rgb(45,232,242)',
    plant: 'rgb(204,239,94)',
    dusk: 'rgb(92,191,234)',
    dawn: 'rgb(225,216,255)',
    mech: 'rgb(218,226,226)',
    bug: 'rgb(255,113,131)',
    reptile: 'rgb(239,147,255)'
};

document.addEventListener('DOMContentLoaded', (event) => {
    // Get the buttons by their ID
    const thumbButton = document.getElementById('thumb-button');
    const listButton = document.getElementById('list-button');

    // Add event listener for the 'Thumb' button
    thumbButton.addEventListener('click', () => {
        window.location.href = 'thumb.html'; // Redirect to thumb.html
    });

    // Add event listener for the 'List' button
    listButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // Redirect to index.html (the current page)
    });
});

function generateColumnHeaders(allAxiesCount, expensiveAxiesCount) {
    const column1Header = document.createElement('div');
    column1Header.id = 'col1-header';
    column1Header.textContent = `All Axies (${allAxiesCount})`;

    const column2Header = document.createElement('div');
    column2Header.id = 'col2-header';
    column2Header.textContent = `Expensive Axies (${expensiveAxiesCount}) `;

    const columnHeaderContainer = document.createElement('div');
    columnHeaderContainer.id = 'column-header';
    columnHeaderContainer.appendChild(column1Header);
    columnHeaderContainer.appendChild(column2Header);

    // Create a container div for the column headers
    const headerContainer = document.createElement('div');
    headerContainer.id = 'header-container';
    headerContainer.appendChild(columnHeaderContainer);

    // Insert the header container as the first child of the body
    document.body.insertBefore(headerContainer, document.body.firstChild);
}



async function fetchRecentAuctions() {
    const query = `
    query MyQuery {
        settledAuctions {
            axies(size: 101) {
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
    const axiesContainer = document.getElementById('axies-container-row'); // Main container for all rows

    // Clear existing content in the axiesContainer
    axiesContainer.innerHTML = '';

    let row = document.createElement('div'); // Initialize the first row
    row.className = 'axie-row';
    axiesContainer.appendChild(row);

    let rowCount = 1;
    const maxRows = 7;
    const itemsPerRow = 14;

    let i = 0;
    axies.forEach((axie, index) => {
        // Check if a new row is needed
        if (index % itemsPerRow === 0 && index !== 0) {
            if (rowCount >= maxRows) {
                return; // Stop creating rows if the maximum has been reached
            }
            row = document.createElement('div');
            row.className = 'axie-row';
            axiesContainer.appendChild(row);
            rowCount++;
        }

        const axieElement = document.createElement('div');

        // Assuming axie.transferHistory.results is an array with at least one item
        // and axieElement is a previously defined DOM element
        console.log(axie.transferHistory.results[0].withPrice)
        console.log(salePriceThreshold)
        if ((parseFloat(axie.transferHistory.results[0].withPrice) / 1e18).toFixed(3) > salePriceThreshold) {
            axieElement.className = 'axie-thumb-expensive';
        } else {
            axieElement.className = 'axie-thumb';
        }
        const axieImageUrl = `https://assets.axieinfinity.com/axies/${axie.id}/axie/axie-full-transparent.png`;
        const classColor = classColors[axie.class.toLowerCase()] || 'white';

        axieElement.innerHTML = `
            <a href="https://app.axieinfinity.com/marketplace/axies/${axie.id}/" target="_blank" style="color: ${classColor};">
                <img src="${axieImageUrl}" alt="Axie #${axie.id}" class="axie-image">
            </a>
            <div class="column-thumb">
                <div>
                    <a href="https://app.axieinfinity.com/marketplace/axies/${axie.id}/" target="_blank" style="color: ${classColor};">${axie.id}</a>
                </div>
                <div>${getTimeAgo(axie.transferHistory.results[0].timestamp)}</div>
                    ${(parseFloat(axie.transferHistory.results[0].withPrice) / 1e18).toFixed(3)} ETH
                </div>
            </div>
        `;

        row.appendChild(axieElement);
        i = i + 1
    });
}





function getTimeAgo(timestamp) {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const saleTime = timestamp; // Sale timestamp in seconds

    const timeDifference = currentTime - saleTime;

    if (timeDifference < 60) {
        return `${timeDifference} seconds ago`;
    } else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        return `${minutes} minutes ago`;
    } else if (timeDifference < 86400) {
        const hours = Math.floor(timeDifference / 3600);
        return `${hours} hours ago`;
    } else {
        const days = Math.floor(timeDifference / 86400);
        return `${days} days ago`;
    }
}


fetchRecentAuctions().then(renderAxies);
