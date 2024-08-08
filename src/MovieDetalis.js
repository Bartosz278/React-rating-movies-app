import { useState, useEffect } from "react";
import { Loader } from "./Loader";
import { ErrorMessage } from "./ErrorMessage";
import StarRating from "./StarRating";

export function MovieDetalis({
  selectedId,
  setSelectedId,
  onAddWatched,
  watched,
  KEY,
}) {
  const [error, setError] = useState("");
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isMovieWatched = watched.map((el) => el.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    setSelectedId("");
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          setSelectedId("");
        }
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [selectedId, setSelectedId]
  );

  useEffect(
    function () {
      async function fetchDetails() {
        try {
          setError("");
          setIsLoading(true);
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );
          if (!response.ok) {
            throw new Error("Something went wrong.");
          }
          const data = await response.json();
          setMovie(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchDetails();
    },
    [selectedId, KEY]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie: ${title}`;

      return function () {
        document.title = "RateMovie";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && (
        <>
          <header>
            <button className="btn-back" onClick={() => setSelectedId("")}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>
          <section>
            {isMovieWatched ? (
              <div className="rating">
                <p>You rated this movie {watchedUserRating}</p>
              </div>
            ) : (
              <div className="rating">
                <StarRating
                  maxRating={10}
                  size={24}
                  onSetRating={setUserRating}
                />
                {userRating > 0 && (
                  <button className="btn-add" onClick={handleAdd}>
                    Add to list
                  </button>
                )}
              </div>
            )}

            <p>
              <em>{plot}</em>
            </p>
            <p>{actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
