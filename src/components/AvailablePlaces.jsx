import { useEffect, useState } from 'react';

import Places from './Places.jsx';
import ErrorPage from './ErrorPage.jsx';

import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces } from '../http.js';

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    //? The following is the non async/await promise handling method
    // fetch('http://localhost:3000/places')
    //   .then((response) => response.json())
    //   .then((data) => setAvailablePlaces([...data.places]))
    //   .catch((error) => console.log(error));

    async function getPlaces() {
      setIsFetching(true);
      try {
        const places = await fetchAvailablePlaces();

        //Note: Because this also takes time, but cannot use async/await (bc it doesn't return a promise)
        //--We have to setIsFetching(false) here inside of the try.
        //--Otherwise, if we set it outside of the try/catch, as before, it would fire immediately after this function was called, not after it resolved.
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const sortedPlaces = sortPlacesByDistance(
              places,
              latitude,
              longitude
            );

            setAvailablePlaces(sortedPlaces);
            setIsFetching(false);
          },
          () => console.log('Geolocation not available')
        );
        //----Old reference code for handling specific error statuses
        // if (response.ok) {
        // } else {
        //   if (response.status === 404) {
        //     throw new Error('404, Not Found');
        //   }
        //   if (response.status === 500) {
        //     throw new Error('500, Internal Server Error');
        //   }
        //   throw new Error(response.status);
        // }
      } catch (error) {
        setError({ message: error.message || 'Could not fetch places' });
        setIsFetching(false);
      }

      // setIsFetching(false);
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
