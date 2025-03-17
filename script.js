// Initialize Supabase client
const SUPABASE_URL = "https://nvlbprsudwnvjcgisuub.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJwcnN1ZHdudmpjZ2lzdXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4Mzk4MjAsImV4cCI6MjA1NTQxNTgyMH0.llqhHFb6aQygKDbkiUDajBU3j4MBmTEsfGTCWSV3Fog";

// Create Supabase client correctly
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get the form element
const rsvpForm = document.getElementById("rsvpForm");

const attendanceRadios = document.getElementsByName('attendance');
const additionalDetails = document.getElementById('additional-details');

function handleAttendanceChange(e) {
  if (e.target.value === 'yes') {
    additionalDetails.style.display = 'block';
    document.getElementById('guests').required = true;
  } else {
    additionalDetails.style.display = 'none';
    document.getElementById('guests').required = false;
    // Reset the additional fields
    document.getElementById('guests').value = '';
    document.getElementById('message').value = '';
  }
}

attendanceRadios.forEach(radio => {
  radio.addEventListener('change', handleAttendanceChange);
});


// Function to show messages
function showMessage(message, isError = false) {
  // Remove any existing message elements
  const existingMessages = document.querySelectorAll(".message");
  existingMessages.forEach((msg) => msg.remove());

  // Create new message element
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isError ? "error-message" : "success-message"
    }`;
  messageDiv.style.display = "block";
  messageDiv.textContent = message;

  // Insert message after the form
  rsvpForm.insertAdjacentElement("afterend", messageDiv);

  // Remove message after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Function to validate form
function validateForm(formData) {
  if (!formData.name || formData.name.trim().length < 2) {
    throw new Error("Please enter a valid name (at least 2 characters)");
  }

  if (!formData.attendance) {
    throw new Error("Please indicate whether you will attend");
  }

  if (formData.attendance === 'yes' && !formData.guestsAdult && !formData.guestsKids) {
    throw new Error("Please enter a valid number of guests (1-5)");
  }
}

// Handle form submission
rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
  // Get form data
  const formData = {
    name: document.getElementById("name").value.trim(),
    attendance: attendance,
    guestsAdult: parseInt(document.getElementById("guestsAdult").value),
    guestsKids: parseInt(document.getElementById("guestsKids").value),
    message: document.getElementById("message").value.trim(),
    submitted_at: new Date().toISOString(),
  };

  try {
    // Validate form data
    validateForm(formData);

    // Disable submit button while processing
    const submitButton = rsvpForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    // Insert data into Supabase
    const { data, error } = await supabase
      .from("rsvp_responses")
      .insert([formData]);

    if (error) throw error;

    // Show success message
    showMessage(
      "Thank you for your RSVP! We look forward to celebrating with you!"
    );

    // Reset form
    rsvpForm.reset();
  } catch (error) {
    // Show error message
    showMessage(
      error.message ||
      "An error occurred while submitting your RSVP. Please try again.",
      true
    );
  } finally {
    // Re-enable submit button
    const submitButton = rsvpForm.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.textContent = "Submit RSVP";
  }
});

// Optional: Add real-time validation for guests input
document.getElementById("guests").addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  if (value < 1) e.target.value = 1;
  if (value > 5) e.target.value = 5;
});

// Optional: Add character counter for message
const messageTextarea = document.getElementById("message");
messageTextarea.addEventListener("input", (e) => {
  const maxLength = 500; // Set your desired maximum length
  if (e.target.value.length > maxLength) {
    e.target.value = e.target.value.substring(0, maxLength);
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const card = document.querySelector('.invitation-card');

  function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    card.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1500);
  }

  setInterval(createSparkle, 300);
});
