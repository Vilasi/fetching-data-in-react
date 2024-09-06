export async function fetchAvailablePlaces() {
  const response = await fetch('http://localhost:3000/places');
  if (!response.ok) {
    throw new Error('The places could not be fetched');
  }
  const data = await response.json();

  return data.places;
}
