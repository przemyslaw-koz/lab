import axios from "axios";

const form = document.querySelector("form")!;
const addressInput = document.getElementById("address")! as HTMLInputElement;

const GOOGLE_API_KEY = "test_key";

type LatLng = { lat: number; lng: number };

type GoogleGeocodingResponse = {
  results: {
    geometry: { location: LatLng };
  }[];
  status: "OK" | "ZERO_RESULTS";
};

const searchAddressHandler = (event: Event) => {
  event.preventDefault();
  const eneteredAddress = addressInput.value;

  //Send api request
  axios
    .get<GoogleGeocodingResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
        eneteredAddress
      )}&key=${GOOGLE_API_KEY}`
    )
    .then((response) => {
      if (response.data.status != "OK") {
        throw new Error("could not fetch location");
      }
      const coordinates = response.data.results[0].geometry.location;
      const map = new google.maps.Map(document.getElementById("map")!, {
        center: coordinates,
        zoom: 8,
      });

      new google.maps.Marker({ position: coordinates, map: map });
    })
    .catch((err) => {
      alert(err.message);
    });
};

form.addEventListener("submit", searchAddressHandler);
