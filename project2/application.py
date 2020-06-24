import os
import sys
import json

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
    

class Messages:
    def __init__(self, channel, message, user, time):
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


# @socketio.on('username', namespace='/private')
# def recieve_username(username):
#     users.append({username : request.sid})
#     print(users)

@socketio.on("user connect") 
def userConnect(data):
    newUser = data["username"]
    if (newUser not in users):
        users.append(newUser)
    for user in users:
        print(user)
    emit('user connected', users, broadcast=True)

# Create a channel
@socketio.on("create channel")
def createChannel(data):
    # OUTPUT TEST
    # print('Hello world!', file=sys.stderr)
    channelList = []
    newChannelName = data["channel name"]
    newChannel = Channel(newChannelName)

    if any(channel.name == newChannel.name for channel in channels):
        error = "Channel name already exists!"
        emit("channel name taken", error, broadcast=False)
    else:
        channels.append(newChannel)
        for channel in channels:
            print(channel.name)
            channelList.append(channel.name)
        emit("add new channel", channelList, broadcast=True)

# Chat input text
@socketio.on("chat input text")
def chatInputText(data, room):
    msgList = []
    newChatText = data["chat text"]
    print(data, room)
    for channel in channels:
        if (room == channel.name):
            channel.newMessage(newChatText)
            msgList = channel.messages
            emit("display chat", msgList, broadcast=True)

# Chat history
@socketio.on("chat history")
def chatHistory(data):
    msgList = []
    channelName = data["channel name"]
    for channel in channels:
        if (channelName == channel.name):
            msgList = channel.messages
            emit("display chat", msgList, broadcast=True)

@socketio.on('join')
def join(data):
    join_room(data['room'])
    send({'msg': data['username'] + " has joined the " + data['room'] + " room."},
        room=data['room'])

@socketio.on('leave')
def leave(data):
    leave_room(data['room'])
    send({'msg': data['username'] + " has left the " + data['room'] + " room."},
        room=data['room'])

