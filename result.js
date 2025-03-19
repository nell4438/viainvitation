// Initialize Supabase client
const SUPABASE_URL = "https://nvlbprsudwnvjcgisuub.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJwcnN1ZHdudmpjZ2lzdXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4Mzk4MjAsImV4cCI6MjA1NTQxNTgyMH0.llqhHFb6aQygKDbkiUDajBU3j4MBmTEsfGTCWSV3Fog";

// Create Supabase client
let supabase;

// Initialize Supabase with error handling
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
} catch (error) {
    console.error('Error initializing Supabase client:', error);
}

// Simple function to test the connection
async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
            .from('rsvp_responses')
            .select('count');

        if (error) {
            console.error('Error testing connection:', error);
            return false;
        }

        console.log('Connection test result:', data);
        return true;
    } catch (error) {
        console.error('Exception during connection test:', error);
        return false;
    }
}

// Function to fetch and display RSVP responses
async function displayRSVPResponses() {
    try {
        console.log('Starting to fetch RSVP responses...');

        const { data, error } = await supabase
            .from('rsvp_responses')
            .select(`
                id,
                name,
                guestsAdult,
                guestsKids,
                message,
                submitted_at,
                attendance
            `)
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            document.getElementById('rsvpResponsesBody').innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">No RSVP responses found</td>
                </tr>
            `;
            return;
        }

        // Calculate totals
        let totalResponses = data.length; // Number of entries/respondents
        let totalAdultGuests = data.reduce((sum, response) => sum + (response.guestsAdult || 0), 0); // Additional adult guests
        let totalKids = data.reduce((sum, response) => sum + (response.guestsKids || 0), 0); // Total kids

        // Calculate final totals
        let totalAdults = totalResponses + totalAdultGuests; // Respondents + their adult guests
        let totalAllGuests = totalAdults + totalKids; // Total of all people (respondents + adult guests + kids)

        // Display the data
        const tbody = document.getElementById('rsvpResponsesBody');
        tbody.innerHTML = '';

        // Add numbered rows for each response
        data.forEach((response, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${response.name || 'N/A'}</td>
                <td>${response.attendance || 'N/A'}</td>
                <td>${response.guestsAdult !== null ? response.guestsAdult : '0'}</td>
                <td>${response.guestsKids !== null ? response.guestsKids : '0'}</td>
                <td>${response.message || 'No message'}</td>
                <td>${new Date(response.submitted_at).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });

        // Add total rows
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td colspan="2"><strong>Number of Responses: ${totalResponses}</strong></td>
            <td><strong>Totals:</strong></td>
            <td><strong>+${totalAdultGuests}</strong></td>
            <td><strong>${totalKids}</strong></td>
            <td colspan="2"></td>
        `;
        tbody.appendChild(totalRow);

        // Add grand total row
        const grandTotalRow = document.createElement('tr');
        grandTotalRow.className = 'grand-total-row';
        grandTotalRow.innerHTML = `
            <td colspan="3"><strong>Grand Totals:</strong></td>
            <td><strong>Total Adults: ${totalAdults}</strong></td>
            <td><strong>Total Kids: ${totalKids}</strong></td>
            <td colspan="2"><strong>Total Guests: ${totalAllGuests}</strong></td>
        `;
        tbody.appendChild(grandTotalRow);

    } catch (error) {
        console.error('Error in displayRSVPResponses:', error);
        document.getElementById('rsvpResponsesBody').innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: red;">
                    Error loading responses: ${error.message}
                </td>
            </tr>
        `;
    }
}


// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing...');

    // Add a loading indicator
    document.getElementById('rsvpResponsesBody').innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center;">Loading responses...</td>
        </tr>
    `;

    // Display responses
    await displayRSVPResponses();

    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Responses';
    refreshButton.className = 'refresh-button';
    refreshButton.onclick = displayRSVPResponses;

    const container = document.querySelector('.rsvp-responses-container');
    container.insertBefore(refreshButton, container.querySelector('.responses-grid'));
});

// Add styles
const styles = `
    .message {
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
    }
    
    .message.error {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
    }
    
    .message.success {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;
    }

    .refresh-button {
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }

    .refresh-button:hover {
        background-color: #45a049;
    }

    .rsvp-responses-container {
        margin: 2rem auto;
        max-width: 1200px;
        padding: 0 1rem;
    }

    .responses-grid {
        overflow-x: auto;
    }

    #rsvpResponsesTable {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
    }

    #rsvpResponsesTable th,
    #rsvpResponsesTable td {
        padding: 0.75rem;
        text-align: left;
        border: 1px solid #ddd;
    }

    #rsvpResponsesTable th {
        background-color: #f5f5f5;
        font-weight: bold;
    }

    #rsvpResponsesTable tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    #rsvpResponsesTable tr:hover {
        background-color: #f0f0f0;
    }
        .total-row {
        background-color: #f0f8ff !important;
        font-size: 1.1em;
    }
    .grand-total-row {
        background-color: #e6ffe6 !important;
        font-size: 1.1em;
    }
    .total-row td,
    .grand-total-row td {
        border-top: 2px solid #333 !important;
        padding: 15px 0.75rem !important;
    }

    #rsvpResponsesTable td {
        vertical-align: middle;
    }

    #rsvpResponsesTable th {
        background-color: #4CAF50;
        color: white;
    }

    #rsvpResponsesTable tr:hover {
        background-color: #f5f5f5;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);