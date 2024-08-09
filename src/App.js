import { useEffect, useState } from "react";
import { MovieDetalis } from "./MovieDetalis";
import { WatchedList } from "./WatchedList";
import { WatchedSummary } from "./WatchedSummary";
import { MovieList } from "./MovieList";
import { Box } from "./Box";
import { Input } from "./Input";
import { NumResult } from "./NumResult";
import { NavBar } from "./NavBar";
import { Main } from "./Main";
import { Logo } from "./Logo";
import { ErrorMessage } from "./ErrorMessage";
import { Loader } from "./Loader";

const KEY = "b8a2cdd0";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [numResult, setNumResult] = useState(null);
  const [selectedId, setSelectedId] = useState("");

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const response = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}
            `,
            { signal: controller.signal }
          );
          if (!response.ok) {
            throw new Error("Something went wrong with fetching movies");
          }

          const data = await response.json();

          if (data.Response === "False") {
            throw new Error(data.Error);
          }

          setMovies(data.Search);
          setSelectedId("");
          setError("");
          setNumResult(data.Search.length);
          console.log(movies);
        } catch (err) {
          if (err.message !== "signal is aborted without reason") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 1) {
        setMovies([]);
        setSelectedId("");
        setError("");
        return;
      }
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query, movies]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Input query={query} setQuery={setQuery} />
        <NumResult numResult={numResult} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} setSelectedId={setSelectedId} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetalis
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              onAddWatched={handleAddWatched}
              watched={watched}
              KEY={KEY}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
