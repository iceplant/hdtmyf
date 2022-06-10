from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import os
from flask import jsonify
from flask import request

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

sid = SentimentIntensityAnalyzer()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:12345@localhost/hdtmyf"
CORS(app)
db = SQLAlchemy(app)

app.config["JWT_SECRET_KEY"] = os.environ["JWT_SECRET_KEY"]
jwt = JWTManager(app)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(10000), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    # neg = db.Column(db.Integer, nullable=True)
    # neu = db.Column(db.Integer, nullable=True)
    # pos = db.Column(db.Integer, nullable=True)
    # compound = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"Event: {self.content}"

    def __init__(self, content):
        self.content = content
        # should data be processed then stored? Or only analyzed on query? Which is more efficient?
        # analysis = sid.polarity_scores(content)
        # self.neg = analysis["neg"]
        # self.neu = analysis["neu"]
        # self.pos = analysis["pos"]
        # self.compound = analysis["compound"]


def format_event(event):
    analysis = sid.polarity_scores(event.content)
    return {
        "content": event.content,
        "id": event.id,
        "created_at": event.created_at,
        "neg": analysis["neg"],
        "neu": analysis["neu"],
        "pos": analysis["pos"],
        "compound": analysis["compound"],
    }


@app.route("/")
def hello():
    return "Hey!"


@app.route("/event", methods=["POST"])
def create_event():
    content = request.json["content"]
    event = Event(content)
    db.session.add(event)
    db.session.commit()
    return format_event(event)


@app.route("/events", methods=["GET"])
def get_events():
    events = Event.query.order_by(Event.id.asc()).all()
    event_list = []
    for event in events:
        event_list.append(format_event(event))
    print(event_list)
    return {"events": event_list}


# @app.route("/events/graph", methods=["GET"])
# def get_events_graph():
#     events = Event.query.order_by(Event.id.asc()).all()
#     event_list = []
#     for event in events:
#         event_list.append(format_event(event))
#     return {"events": event_list}


@app.route("/event/<id>", methods=["GET"])
def get_event(id):
    event = Event.query.filter_by(id=id).one()
    formatted_event = format_event(event)
    return {"event": formatted_event}


@app.route("/event/<id>", methods=["DELETE"])
def delete_event(id):
    event = Event.query.filter_by(id=id).one()
    db.session.delete(event)
    db.session.commit()
    return "Event deleted!"


@app.route("/token", methods=["POST"])
def create_token():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    print("username: ", username, "password: ", password)
    if username != "test" or password != "test":
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)


if __name__ == "__main__":
    app.run()
