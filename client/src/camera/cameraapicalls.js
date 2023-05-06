import { API } from "../backend";

export const addCamera = camera => {
    console.log(localStorage.getItem("jwt"))
  return fetch(`${process.env.REACT_APP_SERVER_URL}/users/registerCamera/${JSON.parse(localStorage.getItem("jwt")).id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(camera)
  })
    .then(response => {
      return response.json();
    })
    .catch(err => console.log(err));
};

