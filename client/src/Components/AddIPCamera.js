import React, { useState } from "react";
import { Link,useHistory } from "react-router-dom";
import { addCamera } from "../camera/cameraapicalls";
// import Navbar from "../Components/Navbar";

const AddIPCamera = () => {

  const history = useHistory();
  const [values, setValues] = useState({
    ip: "",
    name: "",
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
    addCamera({ ip: ip, name: name },)
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
        }
      })
      .catch(console.log("Error in signup"));
  };
//   const RedirectToLogin = ()=>{
//     history.push("/login");
//   }
  const signUpForm = () => {
    return (
      <>
      {/* <Navbar /> */}
      <div className="row">
        <div className="col-md-6 text-center">
          <h1 className="text-dark">Add IP Camera</h1>
        </div>
        <div className="col-md-4 text-left bg-white p-3 offset-md-1 rounded shadow p-3 mb-5 mt-5">
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
         
            <button onClick={onSubmit} className="btn btn-primary w-100 rounded mt-2" type="button">Add IP Camera</button>  
            {/* <div onClick={RedirectToLogin}>Already have an account? Log in</div>  */}
          </form>
        </div>
      </div>
      </>
      
    );
  };

  const successMessage = () => {
    return (
      <div className="row">
        <div className="col-md-4 offset-sm-7 text-left">
          <div
            className="alert alert-success"
            style={{ display: success ? "" : "none" }}
          >
            IP Camera added successfully.
          </div>
        </div>
      </div>
    );
  };

  const errorMessage = () => {
    return (
      <div className="row">
        <div className="col-md-4 offset-sm-7 text-left">
          <div
            className="alert alert-danger"
            style={{ display: error ? "" : "none" }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  };

  return (
      <div>
          {signUpForm()}
          {successMessage()}
          {errorMessage()}   
      </div>
  );
};

export default AddIPCamera;