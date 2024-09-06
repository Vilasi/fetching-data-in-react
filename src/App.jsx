import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import logoImg from './assets/logo.png';

function App() {
  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function getUserPlaces() {
      setIsFetching(true);
      try {
        const response = await fetch('http://localhost:3000/user-places');
        if (!response.ok) {
          console.error('failed to get user places');
        }

        const userPlaces = await response.json();
        // console.log(
        //   'const userPlaces = await response.json();',
        //   typeof userPlaces.places
        // );
        setUserPlaces(userPlaces.places);
        setIsFetching(false);
      } catch (error) {
        console.log('Error fetching user places');
      }
    }
    getUserPlaces();
  }, []);

  // console.log('userPlaces.length:', userPlaces.length);
  // console.log(userPlaces.places.length);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });
  }

  useEffect(() => {
    async function updateUserPlacesFetch() {
      const data = { places: userPlaces };
      console.log(data);
      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };

      try {
        const response = await fetch(
          'http://localhost:3000/user-places',
          requestOptions
        );
        const responseReceived = await response.json();
        console.log(responseReceived);
      } catch (error) {
        console.error('Fetching userPlaces put request error');
      }
    }
    updateUserPlacesFetch();
  }, [userPlaces]);

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    setModalIsOpen(false);
  }, []);

  return (
    <>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
          isLoading={isFetching}
          loadingText="Fetching user places"
        />

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
