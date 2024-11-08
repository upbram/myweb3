document.getElementById('interest-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const projectSelection = document.getElementById('project-selection').value;
    const email = document.getElementById('email').value;
    const painPoint = document.getElementById('pain-point').value;

    const data = {
        project: projectSelection,
        email: email,
        painPoint: painPoint
    };

    try {
        const response = await fetch('/api/submit-interest', { // Call the serverless function
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert('Thanks for the feedback'); // Show success message
        document.getElementById('interest-form').reset(); // Reset the form
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your feedback. Please try again.');
    }
});
