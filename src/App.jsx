import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import logoImg from './assets/logo.png';

import { updateUserPlaces } from './http.js';

function App() {
  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  useEffect(() => {
    async function getUserPlaces() {
      setIsFetching(true);
      try {
        const response = await fetch('http://localhost:3000/user-places');
        if (!response.ok) {
          console.error('failed to get user places');
          throw new Error('Failed to load user places');
        }

        const userPlaces = await response.json();

        setUserPlaces(userPlaces.places);
      } catch (error) {
        console.log('Error fetching user places');
        setError({
          message: error.message || 'There was an error loading user places',
        });
      }
      setIsFetching(false);
    }
    getUserPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || 'Failed to update places',
      });
      console.log('Handle select place fetch failed');
    }
  }

  // useEffect(() => {
  //   async function updateUserPlacesFetch() {
  //     const data = [...userPlaces];
  //     console.log(
  //       'The following is the userPlaces from within the app.js useEffect function'
  //     );

  //     console.log(data);
  //     const requestOptions = {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ places: data }),
  //       mode: 'cors',
  //     };

  //     if (data.length > 0) {
  //       try {
  //         const response = await fetch(
  //           'http://localhost:3000/user-places',
  //           requestOptions
  //         );

  //         if (!response.ok) {
  //           throw new Error('The put request failed to update the userPlaces');
  //         } else {
  //           const responseReceived = await response.json();
  //           console.log(responseReceived);
  //         }
  //       } catch (error) {
  //         console.error('Fetching userPlaces put request error');
  //       }
  //     }
  //   }
  //   updateUserPlacesFetch();
  // }, [userPlaces]);

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        )
      );

      try {
        await updateUserPlaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id)
        );
      } catch (error) {
        setUserPlaces(userPlaces);
        setErrorUpdatingPlaces({
          message:
            error.message || 'The resource was not successfully removed.',
        });
      }

      setModalIsOpen(false);
    },
    [userPlaces]
  );

  function handleUserUpdateError() {
    setErrorUpdatingPlaces();
  }

  function handleFetchUserPlacesError() {
    setError();
  }

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleUserUpdateError}>
        {errorUpdatingPlaces ? (
          <ErrorPage
            title="Updating places failed."
            message={errorUpdatingPlaces.message}
            onConfirm={handleUserUpdateError}
          />
        ) : null}
      </Modal>
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
        {error && (
          <ErrorPage
            title="Error fetching user places"
            message={error.message}
            onConfirm={handleFetchUserPlacesError}
          />
        )}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
            isLoading={isFetching}
            loadingText="Fetching user places"
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
