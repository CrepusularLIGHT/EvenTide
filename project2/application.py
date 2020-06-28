import os
import sys
import json

from time import localtime, strftime
from flask import Flask, render_template, jsonify, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
    

class Channel:
    def __init__(self, name):
        self.name = name
        self.messages = []
    
    def newMessage(self, message):
        maxMessages = 100
        if (len(self.messages) >= maxMessages):
            self.messages.pop(0)
        self.messages.append(message)
    

class Message:
    def __init__(self, message, user, channel, time):
        self.channel = channel
        self.message = message
        self.user = user
        self.time = time

dChan1 = Channel("Default Channel 1")
dChan2 = Channel("Default Channel 2")
dChan3 = Channel("Default Channel 3")

channels = [dChan1, dChan2, dChan3]
history = {}
users = []

# Homepage
@app.route("/")
def index():
    return render_template("index.html", channels=channels, users=users)

# When user connects to server
@socketio.on("user connect") 
def userConnect(username):

    # Check if username is taken
    if (username in users):
        error = "Username is already in use!"
        emit('username taken', error)

    # Prevent repeat names from storing in list of users
    else:
        users.append(username)
        emit('user connected', {'users': users, 'user':username}, broadcast=True)

# Create a channel
@socketio.on("create channel")
def createChannel(channel):
    channelList = []        #Temporary list for channel names
    newChannel = Channel(channel)       #Create channel as Channel Object

    # Make sure channel name doesn't exist in existing channel list
    # Append new channel to channel list
    if any(chan.name == newChannel.name for chan in channels):
        error = "Channel name already exists!"
        emit("channel name taken", error, broadcast=False)
    else:
        channels.append(newChannel)
        # Get all channels names to emit, store in temporary list
        for channel in channels:
            channelList.append(channel.name)
        emit("add new channel", channelList, broadcast=True)

# Chat input text 
# Emits the most recent message in stored channel messages
@socketio.on("chat input text")
def chatInputText(msg, user, channel):
    msgDict = {}        # Temporary dictionary to store message
    time = strftime('%H:%M:%S', localtime())        # Current time string
    newMessage = Message(msg, user, channel, time)      # New Message Object

    # For the current channel, get the most recent message
    for chan in channels:
        if (channel == chan.name):
            # Append current message to Channel Object's Messages
            chan.newMessage(newMessage)
            # Get the most recently added message to display
            for message in chan.messages:
                msgDict = {
                    'message' : message.message,
                    'username' : message.user,
                    'channel' : message.channel,
                    'time' : message.time
                }
            emit("display chat", msgDict, broadcast=True, room=channel)

# Chat history
# Emits the last (up to 100) messages stored for the current channel
@socketio.on("chat history")
def chatHistory(channel):
    msgDict = {}        # Temporary dictionary to store message

    # For the current channel, emit all messages
    for chan in channels:
        if (channel == chan.name):
            for message in chan.messages:
                msgDict = {
                    'message' : message.message,
                    'username' : message.user,
                    'channel' : message.channel,
                    'time' : message.time
                }
                emit("display chat", msgDict, broadcast=False)

# Join channel
# Emits message to all users in current channel
@socketio.on('join')
def join(user, channel):
    join_room(channel)
    msg = user + " has joined " + channel       # Message displayed when user joins
    time = strftime('%H:%M:%S', localtime())

    # No username provided in object, but username is provided in 'msg'
    # This allows JavaScript to see 'msgDict' as a join/leave message
    # The join/leave message is not display the same way as a normal message
    newMessage = Message(msg, '', channel, time) # Create Message Object 

    # Store msg in channel message list
    for chan in channels:
        if (channel == chan.name):
            # Append current message to Channel Object's Messages
            chan.newMessage(newMessage)
            # Get the most recently added message to display
            for message in chan.messages:
                msgDict = {
                    'message' : message.message,
                    'username' : message.user,
                    'channel' : message.channel,
                    'time' : message.time
                }
            emit("display chat", msgDict, broadcast=True, room=channel)


# Leave channel
# Emits message to all users in current channel
@socketio.on('leave')
def leave(user, channel):
    leave_room(channel)
    msg = user + " has left " + channel     # Message displayed when user leaves
    time = strftime('%H:%M:%S', localtime())

    # No username provided in object, but username is provided in 'msg'
    # This allows JavaScript to see 'msgDict' as a join/leave message
    # The join/leave message is not display the same way as a normal message
    newMessage = Message(msg, '', channel, time) # Create Message Object

    # Store msg in channel message list
    for chan in channels:
        if (channel == chan.name):
            # Append current message to Channel Object's Messages
            chan.newMessage(newMessage)
            # Get the most recently added message to display
            for message in chan.messages:
                msgDict = {
                    'message' : message.message,
                    'username' : message.user,
                    'channel' : message.channel,
                    'time' : message.time
                }
            emit("display chat", msgDict, broadcast=True, room=channel)

# Disconnected from server
# Emits new user list that removes disconnected user
@socketio.on('disconnected')
def disconnected(user):
    if (user in users):
        users.remove(user)
    emit('user disconnected', {'users': users, 'user':user}, broadcast=True)

