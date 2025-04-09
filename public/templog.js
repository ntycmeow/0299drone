document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const config = JSON.parse(localStorage.getItem("droneConfig"));
      if (!config) {
        alert("Drone config not found. Please visit the VIEW CONFIG page first.");
        return;
      }
  
      const celsius = document.getElementById("temp").value;
  
      await fetch("/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drone_id: config.drone_id,
          drone_name: config.drone_name,
          country: config.country,
          celsius: Number(celsius),
        })
      });
  
      alert("Log submitted!");
      document.getElementById("logForm").reset();
    });
  });
  