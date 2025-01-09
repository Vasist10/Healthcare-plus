fetch("http://localhost:3000/records")
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      console.log(data.message); 
    } else {
      console.log("Health Records:", data);
    }
  })
  .catch(error => console.error("Error:", error));

  fetch("http://localhost:3000/appointments")
  .then(response => response.json())
  .then(data => {
    console.log("Appointments:", data);
  })
  .catch(error => console.error("Error:", error));
