import { API } from "../backend";

export const addCamera = camera => {
    console.log(localStorage.getItem("jwt"))
  return fetch(`${API}/users/registerCamera/${JSON.parse(localStorage.getItem("jwt")).emailId}`, {
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

