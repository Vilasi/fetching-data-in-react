import { useEffect, useState } from 'react';

import Places from './Places.jsx';
import ErrorPage from './ErrorPage.jsx';

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    // fetch('http://localhost:3000/places')
    //   .then((response) => response.json())
    //   .then((data) => setAvailablePlaces([...data.places]))
    //   .catch((error) => console.log(error));

    async function getPlaces() {
      setIsFetching(true);
      try {
        const response = await fetch('http://localhost:3000/places');

        if (response.ok) {
          console.log('Fetch promise resolved: HTTP status successful');
          const data = await response.json();
          setAvailablePlaces([...data.places]);
          console.log('Places have been set!');
        } else {
          if (response.status === 404) {
            throw new Error('404, Not Found');
          }
          if (response.status === 500) {
            throw new Error('500, Internal Server Error');
          }
          throw new Error(response.status);
        }
      } catch (error) {
        setError({ message: error.message || 'Could not fetch places' });
      }

      setIsFetching(false);
    }

    getPlaces();
  }, []);

  function handleError() {
    setError(undefined);
  }

  console.log(availablePlaces);

  if (error) {
    return (
      <ErrorPage
        title="An error occurred when fetching places"
        message={error.message}
        onConfirm={handleError}
      />
    );
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Fetching places data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
