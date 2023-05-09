import React, { useState } from "react";
import { Link,useHistory } from "react-router-dom";
import { addCamera } from "../camera/cameraapicalls";
import { Modal } from 'react-bootstrap'

function AddCamerarModal({show,setShow,handleClose}) {
     const [values, setValues] = useState({
    ip: "",
    name: "",
    error: "",
    success: false,
    isIp: false,
  });

  const { ip, name, isIp, error, success } = values;

  const handleChange = name => event => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const onSubmit = event => {
    event.preventDefault();
    setValues({ ...values, error: false });
    addCamera({ ip: ip, name: name, isRTSP: isIp },)
      .then(data => {
        if (data.error) {
          setValues({ ...values, error: data.error, success: false });
        } else {
          setValues({
            ...values,
            ip: "",
            name: "",
            error: "",
            success: true
          });
          setShow(false);
          window.location.reload();
        }
      })
      .catch((error)=>console.log("Error in adding ip camera ", error));
  };
  return (
    <Modal show={show} onHide={handleClose}>
        <form>
            <div className="row">
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
            <div className="form-group">
            <label className="text-secondary">Is IP Camera?</label>
            <input type="checkbox" onClick={()=>setValues({...values,isIp:!values.isIp})}></input>
            </div>
            <button onClick={onSubmit} className="btn btn-primary w-100 rounded mt-2" type="button">Add Camera</button>  
            {/* <div onClick={RedirectToLogin}>Already have an account? Log in</div>  */}
        </form>
    </Modal>
     
  )
}

export default AddCamerarModal