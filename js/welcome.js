// Define an array of welcome messages in different languages
var msgs = [
    "Welcome!",
    "Bienvenue!",
    "Willkommen!",
    "Woezɔ!",
    "Akwaaba!"
];

var currentMsgIndex = 0;

// Create a function to display the current message 
// and update the index for the next message
function showMsg() {
    // Get the element to display the message
    var msgElement = document.getElementById("welcomeMessage");
    // Set the text to the current message
    msgElement.innerText = msgs[currentMsgIndex];
    // Increment the index for the next message,or return to the beginning if at the end
    currentMsgIndex = (currentMsgIndex + 1) % msgs.length;
}
// Call the showMsg function every 3 seconds to create a slideshow effect
setInterval(showMsg, 6000)



// window.addEventListener('load', function() {
//     document.getElementById('loading-spinner').style.display = 'block';
// });

// window.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('loading-spinner').style.display = 'none';
// })
document.querySelector('.spinner-container').style.display = 'flex';

window.addEventListener('load', function() {
    document.querySelector('.spinner-container').style.display = 'none';
})