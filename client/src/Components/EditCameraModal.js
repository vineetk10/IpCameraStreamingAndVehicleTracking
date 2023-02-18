import React, {useState} from 'react'
import { Modal, Button } from 'react-bootstrap'
import { API } from "../backend";

function EditCameraModal({show, cameraId,cameraIp, cameraName, handleClose}) {
    const [values, setValues] = useState({
        ip: cameraIp,
        name: cameraName,
        error: "",
        success: false
      });
    
      const { ip, name, error, success } = values;
    
      const handleChange = name => event => {
        setValues({ ...values, error: false, [name]: event.target.value });
      };

      const onSubmit = event => {
        event.preventDefault();
        setValues({ ...values, error: false });
        return fetch(`${API}/users/updateCamera/${JSON.parse(localStorage.getItem("jwt")).emailId}`, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({_id:cameraId, ip: ip, name: name })
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));
      };
  return (
    <Modal show={show} onHide={handleClose}>
   

    <Modal.Body>  <div className="row">
        
            <div className="form-group">
              <label className="text-secondary">Enter IP Address</label>
              <input
                className="form-control"
                onChange={handleChange("ip")}
                type="text"
                value={ip}
              />
            </div>
            </div>            
            <div className="form-group">
              <label className="text-secondary">Name</label>
              <input
                className="form-control"
                onChange={handleChange("name")}
                type="name"
                value={name}
              />
            </div>
         
            <button onClick={onSubmit} className="btn btn-primary w-100 rounded mt-2" type="button">Edit IP Camera</button>  
            {/* <div onClick={RedirectToLogin}>Already have an account? Log in</div>  */}
       </Modal.Body>

    <Modal.Footer>
      <Button onClick={handleClose}>Close</Button>
      <Button bsStyle="primary">Save changes</Button>
    </Modal.Footer>
    </Modal>
    
  )
}

export default EditCameraModal