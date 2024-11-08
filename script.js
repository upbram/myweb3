function selectProject(projectId) {
    document.getElementById("project-selection").value = projectId;
}

function submitInterest(event) {
    event.preventDefault();

    const projectSelection = document.getElementById('project-selection').value;
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('pain-point').value;

    const data = {
        project: projectSelection,
        email: email,
        painPoint: feedback
    };

    fetch('http://localhost:3000/submit-interest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        alert(data.message);
        document.getElementById('interest-form').reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your feedback. Please try again.');
    });
}
