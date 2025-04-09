fetch('/env')
  .then(res => res.json())
  .then(env => {
    console.log('env from /env:', env); 

    fetch(`/config/${env.drone_id}`)
      .then(res => res.json())
      .then(data => {
        console.log('data from /config/:id', data);

        const drone = data.data;

        localStorage.setItem("droneConfig", JSON.stringify(drone));

        document.getElementById("droneId").innerText = drone.drone_id;
        document.getElementById("name").innerText = drone.drone_name;
        document.getElementById("light").innerText = drone.light;
        document.getElementById("country").innerText = drone.country;
      })
      .catch(err => {
        console.error('❌ Error fetching drone config:', err);
      });
  })
  .catch(err => {
    console.error('❌ Error fetching /env:', err);
  });
