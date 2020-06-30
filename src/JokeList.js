import React, { Component } from "react";
import Joke from "./Joke";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10,
  };

  // Initialize state
  constructor(props) {
    super(props);
    // Creating a state array. Getting the data from the local storage we need to parsing JSON.parse(). Then will give an object.
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes")) || [],
      loading: false,
    };
    // Getting jokes to check if we can find a repetitive joke
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
    console.log(this.seenJokes);
    this.handleClick = this.handleClick.bind(this);
  }

  // Loading API Jokes from GET https://icanhazdadjoke.com/
  async componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  async getJokes() {
    try {
      // Initialise state array. only one state array instead of 10
      let jokes = [];

      // Looping through the array. Using while because we might have duplicate ones. If it has duplicate needs to go 11 or 12 to get the unique ones.
      while (jokes.length < this.props.numJokesToGet) {
        // to get JSon version instead of HTML results
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { accept: "application/json" },
        });
        let newJoke = res.data.joke;
        // Testing if does not have a new joke to double check repetition
        if (!this.seenJokes.has(newJoke)) {
          // push into a new object, adding vote
          jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
        } else {
          console.log("FOUND A DUPLICATE");
          console.log(newJoke);
        }
      }
      // This will override the stated array with 10 jokes
      this.setState(
        (st) => ({
          loading: false,
          jokes: [...st.jokes, ...jokes],
        }),
        // Using local storage. it's still be available when refresh the page
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );

    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map(
          // Checking and returning existent j with updated votes
          (j) => (j.id === id ? { ...j, votes: j.votes + delta } : j)
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading ...</h1>
        </div>
      );
    }
    // To ordering the jokes by votes
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span>Jokes
          </h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            New Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {jokes.map((j) => (
            <Joke
              key={j.id}
              votes={j.votes}
              text={j.text}
              upvote={() => this.handleVote(j.id, 1)}
              downvote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default JokeList;
