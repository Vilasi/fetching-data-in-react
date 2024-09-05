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
