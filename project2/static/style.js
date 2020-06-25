var displayName;
var chatBox;
var chatInput;
var chatInputText
var chatInputButton;
var socket;
var selectedChannel;

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected...
    socket.on('connect', () => {

        // Create channel button should emit "create channel" event
        document.querySelector('#create_channel_button').onclick = () => {
            const createChannelName = document.querySelector('#create_channel_name').value;
            socket.emit('create channel', { 'channel name': createChannelName });
            // Clear input field
            document.querySelector('#create_channel_name').value = '';
            document.querySelector('#create_channel_button').disabled = true;
        };

        // Load channels (updates onclick for newly created channels)
        loadChannelList();

        // Chat input 
        document.querySelector('#chat_input_button').onclick = () => {
            var chatInputText = document.querySelector('#chat_input_text').value;
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
        alert(data);
    });

    // Join channel
    socket.on('join channel', (data) => {
        socket.join(data);
    });

    // Display chat
    socket.on('display chat', (data) => {
        var chatBox = document.querySelector('#chat_box');
        var chatBoxText = document.querySelector('#chat_box_text');
        var chatHist = [];


        const p = document.createElement('p');
        const span_username = document.createElement('span');
        const span_timestamp = document.createElement('span');

        if (data.username != '') {
            span_username.innerHTML = data.username + ": ";
        } else {
            span_username.innerHTML = '';
        }
    
        span_timestamp.innerHTML = data.time + " >> ";
        p.innerHTML = span_timestamp.outerHTML + span_username.outerHTML + data.message ;
        chatBoxText.append(p);
    });

    // User connected
    socket.on('user connected', (data) => {
        var usersList = document.querySelector('#user_list');
        var users = data;
        var newUser;
        var i;
        const userElement = document.createElement('li');
        
        for (i=0; i < users.length; i++) {
            newUser = users[i];
        }
        createUserHTML(userElement, newUser);
        usersList.append(userElement);
        console.log('New user connected:', newUser);

        // for (i = 0; i < users.length; i++) {
        //     const userElement = document.createElement('li');
        //     user = users[i];
        //     createUserHTML(userElement, user);
        //     usersList.append(userElement);
        // };
    });

    // Get displayName from previous session, or create new name
    displayName = getDisplayName();
    console.log(displayName, "connected");
    socket.emit('user connect', { 'username': displayName });

    // Create welcome sign for displayName
    document.querySelector('#display_name').innerHTML = displayName;

    // Heading color flashing effect
    window.addEventListener("pageshow", headingColor("#heading"));
    window.addEventListener("pageshow", headingColor("#display_name"));

    // Disable Create Channel button until there is input 
    const createChannelButton = document.querySelector('#create_channel_button');
    var createChannelName = document.querySelector('#create_channel_name');
    createChannelButton.disabled = true;
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
    chatBox = document.querySelector('#chat_box');
    chatInput = document.querySelector('#chat_input');
    chatBox.style.display = "none";
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

/*
// Create new channel
function createChannel() {
    const newChannel = document.createElement('a');
    const createChannelName = document.querySelector('#create_channel_name').value;

    // Check if channel name exists
    if (localStorage.getItem(createChannelName))
        alert("Channel name already exists!");
    else {
        // Create new channel for channel list
        createChannelHTML(newChannel, createChannelName);

        // Add new channel to channel list
        document.querySelector('#channel_list').append(newChannel);

        // Store the new channel in local storage
        localStorage.setItem(createChannelName, newChannel);
    }

    // Create channel on server
    socket.emit('create channel', { 'channel name': createChannelName });

    // Clear input field
    document.querySelector('#create_channel_name').value = '';
    document.querySelector('#create_channel_button').disabled = true;
}
*/

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
    chatBox.style.display = "block";
    chatInput.style.display = "inline-flex";
    document.querySelector('#channel_name_heading').innerHTML = channel;
    selectedChannel = channel;
    document.querySelector('#chat_box_text').innerHTML = '';
    socket.emit('chat history', selectedChannel);
};

function loadChannelList() {
    document.querySelectorAll('.channel-select').forEach(link => {
        link.onclick = () => {
            const channelName = link.name;
            if (selectedChannel) {
                leaveRoom(selectedChannel);
            }
            joinRoom(channelName);
            openChatRoom(channelName);
        };
    });
};

function joinRoom(channel) {
    socket.emit('join', displayName, channel);
    console.log("You joined", channel);
};

function leaveRoom(channel) {
    socket.emit('leave', displayName, channel);
    console.log("You left", channel);
};

function loadUserList() {
};