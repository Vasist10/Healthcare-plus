const API_BASE_URL = "http://localhost:3000"; // Update if backend runs on a different URL

let appointments = [];
let healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];

//handle appointments
function initializeAppointments() {
    // Set minimum date to today
    const dateInput = document.getElementById('appointment-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Handle form submission
    document.getElementById('appointment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const appointment = {
            hospital: document.getElementById('hospital-name').value,
            patientName: document.getElementById('patient-name').value,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            reason: document.getElementById('reason').value,
            createdAt: new Date().toISOString()
        };

        // Add to appointments array
        appointments.push(appointment);
        
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Clear form
        this.reset();
        
        // Update display
        displayAppointments();
        
        // Show success message
        showNotification('Appointment booked successfully!');
    });
}

// Function to set hospital name from map
function setHospitalFromMap(hospitalName) {
    document.getElementById('hospital-name').value = hospitalName;
    // Scroll to appointment form
    document.getElementById('appointments-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Update the showAppointmentForm function
function showAppointmentForm(hospitalName) {
    if (hospitalName) {
        setHospitalFromMap(hospitalName);
    }
}

function loadAndDisplayAppointments() {
    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
        appointments = JSON.parse(savedAppointments);
    }
    displayAppointments();
}

function displayAppointments() {
    const appointmentsContainer = document.getElementById('your-appointments');
    
    if (!appointments.length) {
        appointmentsContainer.innerHTML = `
            <div class="empty-appointments">
                <p>No appointments scheduled yet</p>
            </div>
        `;
        return;
    }

    let appointmentsHTML = '';
    appointments.forEach((appointment, index) => {
        const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
        const formattedDate = appointmentDate.toLocaleDateString();
        const formattedTime = appointmentDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        appointmentsHTML += `
            <div class="appointment-item">
                <strong>Hospital:</strong> ${appointment.hospital}<br>
                <strong>Patient:</strong> ${appointment.patientName}<br>
                <strong>Date:</strong> ${formattedDate}<br>
                <strong>Time:</strong> ${formattedTime}<br>
                ${appointment.reason ? `<strong>Reason:</strong> ${appointment.reason}<br>` : ''}
                <button onclick="deleteAppointment(${index})" class="btn btn-sm btn-danger mt-2">
                    Cancel Appointment
                </button>
            </div>
        `;
    });

    appointmentsContainer.innerHTML = appointmentsHTML;
}

function deleteAppointment(index) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        appointments.splice(index, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        displayAppointments();
    }
}

// Handle Nearby Hospital Locator
// Initialize the map with a default location (Chennai)
const map = L.map('map').setView([13.082680, 80.270718], 13);

// Add tile layer for OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to fetch and display hospitals
document.getElementById("find-hospitals-btn").addEventListener("click", function() {
  // Get user's current location
  document.getElementById("hospital-details").innerHTML = "";
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        // Success callback
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Center map on user's location
        map.setView([userLat, userLng], 13);
        
        // Add marker for user's location
        L.marker([userLat, userLng])
          .addTo(map)
          .bindPopup('Your Location')
          .openPopup();

        // Overpass API query for hospitals within a 5 km radius of user's location
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="hospital"](around:20000,${userLat},${userLng}););out;`;

        // Fetch hospitals data
        fetch(overpassUrl)
          .then(response => response.json())
          .then(data => {
            // Clear previous markers (except user location)
            map.eachLayer(layer => {
              if (layer instanceof L.Marker) {
                map.removeLayer(layer);
              }
            });
            const redIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            
            
            // Re-add user location marker
            L.marker([userLat, userLng], { icon: redIcon })
              .addTo(map)
              .bindPopup('Your Location')
              .openPopup();

            // Add markers for each hospital found
            const hospitalDetailsDiv = document.getElementById("hospital-details");
            hospitalDetailsDiv.innerHTML = ""; // Clear previous results
            
            // Add scrollable style to hospital-details
            hospitalDetailsDiv.style.maxHeight = "300px";
            hospitalDetailsDiv.style.overflowY = "auto";
            hospitalDetailsDiv.style.padding = "10px";
            
            let hospitalsFound = 0;
            
            data.elements.forEach(hospital => {
              if (hospital.tags.name) {
                hospitalsFound++;
                const name = hospital.tags.name;
                const phone = hospital.tags.phone;
                const address = hospital.tags["addr:street"] || hospital.tags["addr:full"] || hospital.tags.address;
                
                let hospitalInfo = `<div class="hospital-card">
                    <div class="hospital-info">
                        <h3>🏥 ${name}</h3>
                        ${address ? `<p class="address">📍 ${address}</p>` : ''}
                        ${phone ? `<p class="phone">📞 ${phone}</p>` : ''}
                        <div class="hospital-actions">
                            <button onclick="showAppointmentForm('${name.replace(/'/g, "\\'")}')" class="btn btn-primary">Book Appointment</button>
                        </div>
                    </div>
                </div>`;
                
                hospitalDetailsDiv.innerHTML += hospitalInfo;
              }
            });

            if (hospitalsFound === 0) {
              hospitalDetailsDiv.innerHTML = "<div class='hospital-item'>No hospitals found in this area</div>";
            }
          })
          .catch(error => console.error('Error fetching hospitals:', error));
      },
      function(error) {
        // Error callback
        console.error("Error getting location:", error);
        alert("Unable to get your location. Using default location (Chennai).");
      },
      {
        // Options
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
});

function showMedicalRecordForm() {
    // Load existing records first
    healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
    
    const recordForm = document.getElementById("record-form");
    const searchInput = document.getElementById("search-records");
    const filterType = document.getElementById("filter-type");

    recordForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Get existing records first
        let healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
        
        const newRecord = {
            id: Date.now(),
            date: document.getElementById("record-date").value,
            type: document.getElementById("record-type").value,
            doctorName: document.getElementById("doctor-name").value,
            details: document.getElementById("record-details").value,
            createdAt: new Date().toISOString()
        };

        // Add new record to the beginning of the array
        healthRecords.unshift(newRecord);
        
        // Save to localStorage
        localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
        
        // Reset form and display updated records
        this.reset();
        displayHealthRecords();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addRecordModal'));
        if (modal) {
            modal.hide();
        }
        
        showNotification('Health record saved successfully!');
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        displayHealthRecords();
    });

    // Filter functionality
    filterType.addEventListener('change', () => {
        displayHealthRecords();
    });

    displayHealthRecords();
}

function displayHealthRecords(records = null) {
    const recordsList = document.getElementById("records-list");
    // If no specific records provided, get from localStorage
    const displayRecords = records || JSON.parse(localStorage.getItem('healthRecords')) || [];
    
    if (displayRecords.length === 0) {
        recordsList.innerHTML = `
            <div class="text-center py-5">
                <h4>No Health Records Yet</h4>
                <p class="text-muted">Start building your medical history by adding your first health record.</p>
            </div>
        `;
        return;
    }

    // Clear the existing list
    recordsList.innerHTML = '';

    // Display each record
    displayRecords.forEach(record => {
        const recordElement = document.createElement('div');
        recordElement.className = 'card mb-3';
        recordElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${record.type}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Date: ${record.date}</h6>
                <p class="card-text"><strong>Doctor:</strong> ${record.doctorName}</p>
                <p class="card-text">${record.details}</p>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord(${record.id})">Delete</button>
            </div>
        `;
        recordsList.appendChild(recordElement);
    });
}

// Add this function to handle record deletion
function deleteRecord(recordId) {
    let healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
    healthRecords = healthRecords.filter(record => record.id !== recordId);
    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
    displayHealthRecords();
    showNotification('Health record deleted successfully!');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✓</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAppointments();
    loadAndDisplayAppointments();
    showMedicalRecordForm();
});
