document.addEventListener("DOMContentLoaded", async () => {
  try {

    const config = JSON.parse(localStorage.getItem("droneConfig"));
    if (!config) {
      alert("Drone config not found. Please visit the VIEW CONFIG page first.");
      return;
    }


    const res = await fetch(`/logs?drone_id=${config.drone_id}`);
    const { data } = await res.json();


    const sortedData = data.sort((a, b) => new Date(b.created) - new Date(a.created));


    const limitedData = sortedData.slice(0, 25);

    const tbody = document.getElementById("logTable");
    limitedData.forEach(log => {
      const row = `<tr>
        <td>${log.created}</td>
        <td>${log.drone_id}</td>
        <td>${log.drone_name}</td>
        <td>${log.country}</td>
        <td>${log.celsius}</td>
      </tr>`;
      tbody.innerHTML += row;
    });
  } catch (err) {
    console.error('❌ Error loading logs:', err);
  }
});
