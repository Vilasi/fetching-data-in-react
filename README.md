# fetching-data-in-react

One of the foremost ways to fetch data in a React app is through the use of good ol' http requests: requesting (through the use of the builtin fetch API, or something like Axios, etc) data from some API, whether a third part API, or one which we have built and are hosting in a server to store our data.

This is much the same as how data is fetched from an API in a regular JS web project, but in the case of React, as one might expect, our UI will be updated according to this data we receive.

Commonly, the data that we're accessing will be stored as a state value, thereby the UI can update when data is received. The typical lifecycle of getting data is to, inside of the component in which we're managing the state, call a fetch request at our specified API url, and then store the response data as a state value. Because we're updating the state according to the data we get back from our fetch request, this is best accomplished inside of a useEffect. That way, when the component function mounts to the DOM, the useEffect will fire our fetch request, and then inside of the useEffect the state will be updated with the returned data - thereby reexecuting our component.

But, because the data is fetched inside of the useEffect (particularly a useEffect with an empty dependency array), the component data fetching will not be rerun when the component's state update reexecutes the component - avoiding an infinite loop of component updates and data fetches.

## Handling loading states between fetches

One of the ways to handle a loading state is quite simple. Just add a state check, something like `const [isFetching, setIsFetching] = useState(false);`. Then, inside the fetching function, surround the fetch call with the state changes. The state will be true while the data is still being fetched, then will be set back to false when the date resolves:

```
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
```

## Fetch error handling

Error handling when using the fetch API inside of React is best accomplished using both the try/catch block - when inside of an async/await call - as well as a specific check to ensure our response status is ok. That is, when we call `const response = await fetch('http://localhost:3000/places');` inside of a try/catch, if the whole thing fails we will error our and be caught by the catch block. However, the response can fail while still successfully returning a value to response - that is, the response can return a `!response.ok`, which would not be natively caught by catch. Therein, we want to do an if check on the response.ok and throw our own error which will be caught in the catch. This can be further bolstered by checking for specific statuses inside of the if/else check - checking to see what kind of response status we got and throwing specific errors for that:

```
try {
    setIsFetching(true);
    const response = await fetch('http://localhost:3000/places');

    if (response.ok) {
        console.log('Fetch promise resolved: HTTP status successful');
        const data = await response.json();
        setAvailablePlaces([...data.places]);
        setIsFetching(false);
        console.log('Places have been set!');
    } else {
        setIsFetching(false);
        if (response.status === 404) throw new Error('404, Not Found');
        if (response.status === 500)
        throw new Error('500, Internal Server Error');
        throw new Error(response.status);
    }
} catch (error) {
    console.error('Fetch', error);
}
```

And, since this is React, in the catch, we can update the UI to reflect the error status. Often, this is done using a specified Error catching component of some sort. Check the ErrorPage component in this directory to see an example.

When building a component that handles and renders fetched data, it is common to have the following three things managed as state:

1. The data you fetch - stored in state
2. A boolean to see if the data is currently being fetched
3. An error state, which is just undefined to start, and which gets the error message when there is one (If there is anything stored in this state, we render the error component).

```
const [availablePlaces, setAvailablePlaces] = useState([]);
const [isFetching, setIsFetching] = useState(false);
const [error, setError] = useState();
```

## Manipulating fetched data

Data can, of course, be manipulated after it has been fetched. However, take care that, if you do any manipulations to it that take time to resolve - and you don't want to display it to the user until after the manipulation has finished - you have to set the isFetching state to false after this is finished, within the try/catch. Otherwise, if you place the isFetching state updating function after the try/catch (that is, only if the data manipulation doesn't return a promise [can't be used with async/await]), it will fire before the final data manipulation has finished. This is especially the case if you use async browser APIs, like the navigator.geolocation API, which perform asynchronously but which themselves don't return promises. Keep an eye out for these.

## Optimistic State Updating

Sometimes, when we want to make a change to a database - add some data - we'll want that update to be reflected in the DOM. One way to accomplish this is with a little bit of a cheat: Optimistic State Updating.

What we do here is: In a function where we're sending a fetch request to update our data, we will first set a state updating function that updates our state to reflect this updated data, and then, right after, instantiate our api call (the POST, Put, Patch, etc). Thereby, to the user, the state updates immediately to reflect the changed data, then in the background, the data is actually pushed to the backend/database

This could look like the following. Note that , in this function (which is selecting a place for the user, which triggers a PUT request) the first thing that is done is that the userPlaces are updated using the selected place. Then, in the try/catch block, the PUT request is sent, with the catch variable resetting the state to the current (that is, the previous state before the new render cycle) state:

```
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
      console.log('Handle select place fetch failed');
    }
}
```

The opposite approach here would be to put that fetch function up above the state updating function, wherein we wouldn't be running the state update until after the fetch is completed.

In that instance, it would be a good idea to implement some sort of loading bar/spinning wheel (or whatever other loading indicating component) thing into the UI for a better UX. heh
