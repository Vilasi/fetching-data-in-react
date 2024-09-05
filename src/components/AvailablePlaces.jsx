import { useEffect, useState } from 'react';

import Places from './Places.jsx';

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // fetch('http://localhost:3000/places')
    //   .then((response) => response.json())
    //   .then((data) => setAvailablePlaces([...data.places]))
    //   .catch((error) => console.log(error));

    async function getPlaces() {
      try {
        setIsFetching(true);
        const response = await fetch('http://localhost:3000/places');
        const data = await response.json();
        setAvailablePlaces([...data.places]);
        setIsFetching(false);
        console.log('Places have been set!');
      } catch (error) {
        console.log(error);
      }
    }

    getPlaces();
  }, []);

  console.log(availablePlaces);

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
