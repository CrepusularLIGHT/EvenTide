// Global variables
var displayName; // User's saved username (self)
var chatBoxWindow; // Chat box window, opens with channel selection
var chatInput; // Chat input text box and button
var chatInputText; // Chat input text box
var chatInputButton; // Chat input button
var socket; // Socket.IO
var selectedChannel; // Channel that user is currently in 
var textColorSelect; // Default text color for chatBoxWindow
var usernameColorSelect; // Default username text colors for chatBoxWindow

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected...
    socket.on('connect', () => {

        // Create channel button should emit "create channel" event
        document.querySelector('#create_channel_button').onclick = () => {
            // Take value from text box for channel name
            const createChannelName = document.querySelector('#create_channel_name').value;
            // Display new created channel to all users
            socket.emit('create channel', createChannelName);
            // Clear input field
            document.querySelector('#create_channel_name').value = '';
            document.querySelector('#create_channel_button').disabled = true;
        };

        // Load channels (updates onclick for newly created channels)
        loadChannelList();

        // Remember Channel from previous session
        rememberChannel();

        // Chat input button (submit chat text)
        document.querySelector('#chat_input_button').onclick = () => {
            // Take value from text box for chat input
            var chatInputText = document.querySelector('#chat_input_text').value;
            // Display the message to all users in the selected channel
            socket.emit('chat input text', chatInputText, displayName, selectedChannel);
            // Clear input field
            document.querySelector('#chat_input_text').value = '';
            document.querySelector('#chat_input_button').disabled = true;
        };
    });

    // When new channel is created, add to channels list
    socket.on('add new channel', (data) => {
        var channel;
        var newChannel;
        const channelElement = document.createElement('a');
        var channelList = document.querySelector('#channel_list');

        // Get the last channel (most recently added)
        for (channel in data)
            newChannel = data[channel];
        // Create channel HTML attributes
        createChannelHTML(channelElement, newChannel);
        // Add to channel list
        channelList.append(channelElement);
        // Reload channel list
        loadChannelList();
    });

    // Channel name taken error
    socket.on('channel name taken', (data) => {
        alert(data); // "Channel name already exists!"
    });

    // Display chat
    socket.on('display chat', (data) => {
        var chatBox = document.querySelector('#chat_box');
        var chatBoxText = document.querySelector('#chat_box_text');

        // p element to contain chat text
        const p = document.createElement('p');
        p.setAttribute('class', 'chat-box-text ' + textColorSelect);

        // span element to contain timestamp
        const span_timestamp = document.createElement('span');
        span_timestamp.setAttribute('class', 'timestamp');
        span_timestamp.innerHTML = "<" + data.time + "> ";

        // span element to contain username
        const span_username = document.createElement('span');
        span_username.setAttribute('class', 'username ' + usernameColorSelect);

        // If username is not blank
        if (data.username != '') {
            span_username.innerHTML = data.username + ": ";

            // If no username (used when users join/leave room)
        } else {
            span_username.innerHTML = '';
        }

        // add text to p element and append to end of messages list for channel
        p.innerHTML = span_timestamp.outerHTML + span_username.outerHTML + data.message;
        chatBoxText.append(p);

        // Scroll to bottom for new message
        chatBox.scrollTop = chatBox.scrollHeight
    });

    // Get displayName from previous session, or create new name
    // Store in global variable 'displayName'
    displayName = getDisplayName();

    // Store username on server username list
    socket.emit('user connect', displayName);

    // Default text color
    textColorSelect = "text-dark";
    usernameColorSelect = "text-dark";

    // Remove username from users list on disconnect
    window.onbeforeunload = disconnected;

    // When a user connects to server
    // Generate updated list of users
    // data = 'users': list of all users, 'user': new user
    socket.on('user connected', (data) => {
        var usersList = document.querySelector('#user_list');
        var users = data.users;
        var newUser = data.user;

        // Print to console
        console.log(newUser, "connected")

        // Clear current user list
        usersList.innerHTML = '';

        // Generate user list
        var i;
        for (i = 0; i < users.length; i++) {
            const userElement = document.createElement('li');
            createUserHTML(userElement, users[i]);
            usersList.append(userElement);
        }
    });

    // When a user disconnects from server
    // Generate an updeated list of users
    // data = list of all users
    socket.on('user disconnected', (data) => {
        var usersList = document.querySelector('#user_list');
        var users = data.users;
        var leftUser = data.user;

        // Print to console
        console.log(leftUser, "has disconnected");

        // Clear current user list
        usersList.innerHTML = '';

        // Generate user list
        var i;
        for (i = 0; i < users.length; i++) {
            const userElement = document.createElement('li');
            createUserHTML(userElement, users[i]);
            usersList.append(userElement);
        }
    });

    // Username is taken
    // data = error message
    socket.on('username taken', (data) => {
        alert(data); // "Username is already in use!"
        displayName = getDisplayName();
        socket.emit('user connect', displayName);
    });

    // Create welcome sign for displayName
    document.querySelector('#display_name').innerHTML = displayName;

    // Heading color flashing effect
    window.addEventListener("pageshow", headingColor("#heading"));
    window.addEventListener("pageshow", headingColor("#display_name"));

    // Disable Create Channel button until there is input 
    const createChannelButton = document.querySelector('#create_channel_button');
    var createChannelName = document.querySelector('#create_channel_name');
    createChannelButton.disabled = true;

    // Once there is input, button is enabled
    createChannelName.addEventListener("keyup", function(event) {
        if (createChannelName.value.length > 0)
            createChannelButton.disabled = false;
        else
            createChannelButton.disabled = true;
        // Cancel default action for "Enter" key
        if (event.keyCode === 13) {
            createChannelButton.click();
        }
    });

    // Hide the chatroom until one is selected
    chatBoxWindow = document.querySelector('#chat_box_window');
    chatInput = document.querySelector('#chat_input');
    chatBoxWindow.style.display = "none";
    chatInput.style.display = "none";

    // Disable chatInput until there is input
    chatInputButton = document.querySelector('#chat_input_button');
    chatInputText = document.querySelector('#chat_input_text');
    chatInputButton.disabled = true;
    chatInputText.addEventListener("keyup", function(event) {
        if (chatInputText.value.length > 0 && chatInputText.value != '')
            chatInputButton.disabled = false;
        else
            chatInputButton.disabled = true;
        // Cancel default action for "Enter" key
        if (event.keyCode === 13) {
            chatInputButton.click();
        };
    });

    // Change color of default text
    document.querySelectorAll('.def-text-color').forEach(link => {
        link.onclick = () => {
            textColorSelect = link.dataset.value;
            document.querySelector('#chat_box_text').innerHTML = '';
            socket.emit('chat history', selectedChannel);
        };
    });

    // Change color of usernames in chat box
    document.querySelectorAll('.username-color').forEach(link => {
        link.onclick = () => {
            usernameColorSelect = link.dataset.value;
            document.querySelector('#chat_box_text').innerHTML = '';
            socket.emit('chat history', selectedChannel);
        };
    });

    // Change color style of text
    document.querySelectorAll('.text-color').forEach(link => {
        link.onclick = () => {
            const currentInputText = document.querySelector('#chat_input_text').value;
            const colorSelect = link.dataset.value;
            const adjustedInputText = "<span style='color:" + colorSelect + "'>" + currentInputText + "</span>"
            document.querySelector('#chat_input_text').value = adjustedInputText;
        };
    });

    // Change style of text
    document.querySelectorAll('.text-style').forEach(link => {
        link.onclick = () => {
            const currentInputText = document.querySelector('#chat_input_text').value;
            const styleSelect = link.dataset.value;
            var adjustedInputText;

            if (styleSelect === 'bold') {
                adjustedInputText = "<b>" + currentInputText + "</b>"
            } else if (styleSelect === 'italic') {
                adjustedInputText = "<i>" + currentInputText + "</i>"
            } else if (styleSelect === 'underline') {
                adjustedInputText = "<u>" + currentInputText + "</u>"
            } else if (styleSelect === 'heading') {
                adjustedInputText = "<h4>" + currentInputText + "</h4>"
            } else {
                adjustedInputText = currentInputText;
            }

            document.querySelector('#chat_input_text').value = adjustedInputText;
        };
    });
});

// Retrieves displayName from local storage, or assigns and stores new displayName
function getDisplayName() {
    var setDisplayName;
    const names = ["John", "Pam", "Dwight", "Michael", "Andy", "Creed", "Jan", "Kevin", "Toby", "Stanley", "Ryan"]
    var savedDisplayName = localStorage.getItem('displayName');

    // If there is a saved displayName in local storage, prompt for displayName change
    if (savedDisplayName != "null" && savedDisplayName != null && savedDisplayName != "") {
        setDisplayName = localStorage.getItem('displayName');
        var newDisplayName = prompt('Welcome back! Select new name? (Must be more than 3 characters)', setDisplayName);
        setDisplayName = newDisplayName;

        // If there is no displayName stored in local storage, generate a new one, or allow user to create new name
    } else {
        // Selects a randomly generated name from list 'names'
        var i = Math.floor(Math.random() * 11);
        setDisplayName = prompt('Display name: (Randomly Generated or type your own!)', names[i]);
    };

    // If the name entered into the prompt is empty, or they pressed "cancel", or less than 3 characters
    // Then the prompt is redisplayed until a proper name is selected
    if (setDisplayName == null || setDisplayName == "" || setDisplayName.length < 3) {
        setDisplayName = getDisplayName();
        return setDisplayName;
    };

    // Store the displayName into local storage
    localStorage.setItem('displayName', setDisplayName);

    return setDisplayName;
};

// Remebers channel from previous session
function rememberChannel() {
    var savedChannel = localStorage.getItem('channelName');

    // If there is a saved channelName in local storage, load channel
    if (savedChannel != "null" && savedChannel != null && savedChannel != "") {
        openChatRoom(savedChannel);
    }
};

// Flashing colors
// Global variables for flashing colors
var i = 0;
const colors = ["red", "blue", "green", "teal"];
// Flashing colors for heading
function headingColor(id) {
    if (i == 4) {
        i = 0;
    };
    document.querySelector(id).style.color = colors[i];
    setTimeout(function() {
        headingColorFlash(id);
    }, 200);
    ++i;
};
// Flashing colors for heading
function headingColorFlash(id) {
    document.querySelector('#heading').style.color = "orange";
    setTimeout(function() {
        headingColor(id);
    }, 200);
};

// Adds HTML attributes for new channel
function createChannelHTML(channel, name) {
    channel.setAttribute('href', '#');
    channel.setAttribute('class', 'list-group list-group-item-action text-info channel-select');
    channel.setAttribute('name', name);
    channel.innerHTML = name;
};

// Adds HTML attributes for new user
function createUserHTML(element, name) {
    element.setAttribute('class', 'text-danger');
    element.setAttribute('name', name);
    element.innerHTML = name;
};

// Opens chat room 
function openChatRoom(channel) {
    // Display chat window
    chatBoxWindow.style.display = "block";
    chatInput.style.display = "inline-flex";
    // Get channel name to display as heading
    document.querySelector('#channel_name_heading').innerHTML = channel;
    // Store seleced channel in global variable
    selectedChannel = channel;
    // Clear the current chat window
    document.querySelector('#chat_box_text').innerHTML = '';
    // Load the history for current channel
    socket.emit('chat history', selectedChannel);
    // Join the room
    joinRoom(channel);
    // Store current channel in local storage
    localStorage.setItem('channelName', channel);
};

// Channel list
// When clicked, joins channel and leaves current channel 
function loadChannelList() {
    document.querySelectorAll('.channel-select').forEach(link => {
        link.onclick = () => {
            const channelName = link.name;

            // If user clicks current channel (that they are already in)
            if (selectedChannel == channelName) {
                alert('You are already in that channel!');

                // If click new channel, leave current channel and join new channel
            } else {
                // Possible that user is not in any channel
                if (selectedChannel) {
                    // Leave previous channel
                    leaveRoom(selectedChannel);
                }
                // Open chat room
                openChatRoom(channelName);
            }
        };
    });
};

// Join new channel
function joinRoom(channel) {
    socket.emit('join', displayName, channel);
    console.log("You joined", channel);
};

// Leave current channel
function leaveRoom(channel) {
    socket.emit('leave', displayName, channel);
    console.log("You left", channel);
};

// On disconnect (window.onbeforeunload)
function disconnected() {
    socket.emit('disconnected', displayName);
};