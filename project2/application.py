import os
import sys
import json

from flask import Flask, render_template, jsonify, request, session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


class User:
    def __init__(self, username, id):
        self.username = username
        self.id = id
    

class Channel:
    def __init__(self, name):
        self.name = Name
        self.messages = []
    
    def newMessage(self, message):
        maxMessages = 100
        if len(self.messages >= maxMessages):
            self.messages.pop(0)
        self.messages.append(message)
    

class Messages:
    def __init__(self, channel, message, user, time):
        self.channel = channel
        self.message = message
        self.user = user
        self.time = time


channels = ["default channel 1", "default channel 2", "default channel 3"]
history = {}
users = []

# Homepage
@app.route("/")
def index():
    return render_template("index.html", channels=channels)

# 
# @socketio.on('username', namespace='/private')
# def recieve_username(username):
#     users.append({username : request.sid})
#     print(users)

@socketio.on("user connect") 
def userConnect(data):
    session["username"] = data["username"]
    newUser = User(data["username"], request.sid)
    users.append(newUser)
    for user in users:
        print (user.username, user.id)
    emit('user connected', jsonify(users), broadcast=True)

# Create a channel
@socketio.on("create channel")
def createChannel(data):
    # OUTPUT TEST
    # print('Hello world!', file=sys.stderr)
    newChannel = data["channel name"]

    if (newChannel in channels):
        error = "Channel name already exists!"
        emit("channel name taken", error, broadcast=False)
    else:
        channels.append(newChannel)
        print(channels)
        emit("add new channel", channels, broadcast=True)

# Chat input text
@socketio.on("chat input text")
def chatInputText(data, channel):
    newChatText = data["chat text"]
    history[channel] = newChatText
    print(data, channel)
    emit("display chat", history[channel], broadcast=True)

# Chat history
@socketio.on("chat history")
def chatHistory(data):
    channelName = data["channel name"]
    channelHist = history[channelName]
    emit("display chat", channelHist, broadcast=True)

